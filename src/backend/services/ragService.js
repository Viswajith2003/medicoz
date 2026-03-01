// ragService.js
// Uses local @xenova/transformers for embeddings (free, no API cost).
// Uses Hugging Face router for LLM with graceful fallback.

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY; // kept for reference
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Shared lazy-loaded local embedding pipeline (same model as ingestService)
let embeddingPipeline = null;
async function getLocalEmbedding(text) {
  if (!embeddingPipeline) {
    const { pipeline } = await import('@xenova/transformers');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');
  }
  const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Retrieves relevant medical context from Pinecone vector database.
 */
async function getRelevantContext(query) {
  try {
    const queryEmbedding = await getLocalEmbedding(query);

    const pineconeResponse = await fetch(
      `https://${PINECONE_HOST}/query`,
      {
        method: "POST",
        headers: {
          "Api-Key": PINECONE_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vector: queryEmbedding,
          topK: 5,
          includeMetadata: true,
        })
      }
    );

    if (!pineconeResponse.ok) {
      throw new Error(`Pinecone search error ${pineconeResponse.status}`);
    }

    const data = await pineconeResponse.json();
    const context = data.matches
      .filter(match => match.score > 0.3)
      .map((match) => match.metadata.text)
      .join("\n\n");

    return context || "No relevant medical records found.";
  } catch (error) {
    console.error("Error retrieving context:", error.message);
    return "";
  }
}

/**
 * Formats the raw Pinecone context into a clean, structured medical response.
 * Used as fallback when the LLM is not available.
 */
function formatContextAsResponse(query, context) {
  const lines = context
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 20); // Remove very short fragments

  // Split into paragraphs of substance
  const paragraphs = [];
  let current = "";
  for (const line of lines) {
    if (line.length > 0) {
      current += (current ? " " : "") + line;
      if (current.length > 300) {
        paragraphs.push(current.trim());
        current = "";
      }
    }
  }
  if (current) paragraphs.push(current.trim());

  const topParagraphs = paragraphs.slice(0, 5); // Show up to 5 relevant points

  const bulletPoints = topParagraphs.map(p => `👉 ${p}`).join("\n\n");

  return `Here is what your medical reference book says about this:\n\n${bulletPoints}\n\n⚕️ Always consult a licensed healthcare professional for clinical decisions.`;
}

/**
 * Generates a medical response using Google Gemini (free tier: 1500 req/day).
 * Falls back to returning the retrieved context if Gemini is unavailable.
 */
async function generateMedicalResponse(query, context) {
  if (!context || context === "No relevant medical records found.") {
    return "❓ I couldn't find specific information about that topic in our verified medical sources. Please consult a healthcare professional for accurate advice.";
  }

  // Try Google Gemini
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      console.warn("[RAG] Gemini API key not set. Using context fallback.");
      return formatContextAsResponse(query, context);
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are MediCoz, a specialized medical AI assistant.
Answer the user's question using ONLY the provided medical context.
If the context does not contain the answer, say: "This information is not available in our current medical database."
Do not use outside knowledge. Do not hallucinate.

STRICT FORMATTING RULES:
- Start with a short one-line summary of the answer.
- Then list each key point using the 👉 emoji at the start.
- Add a blank line between each 👉 point.
- End with a short note like: "⚕️ Always consult a licensed healthcare professional for clinical decisions."
- Do NOT use markdown like **, ##, or *.

MEDICAL CONTEXT:
${context.substring(0, 3000)}

USER QUESTION: ${query}

ANSWER:`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 10) {
        console.log("[RAG] Gemini response used successfully.");
        return text.trim();
      }
    } else {
      const errBody = await geminiRes.text();
      console.warn(`[RAG] Gemini returned HTTP ${geminiRes.status}: ${errBody.substring(0, 100)}`);
    }
  } catch (geminiError) {
    console.warn("[RAG] Gemini call failed:", geminiError.message);
  }

  // Graceful fallback: return the Pinecone context formatted as a structured response
  console.log("[RAG] Using formatted context fallback.");
  return formatContextAsResponse(query, context);
}

module.exports = { getRelevantContext, generateMedicalResponse };




// The "brain" of the chatbot. Called every time a user sends a chat message.

// User Question: "What is spasticity?"
//    │
//    ▼
// getLocalEmbedding(question)
//    → [0.12, -0.45, 0.87, ...] (384 numbers)
//    │
//    ▼
// Pinecone query → find 5 most similar vectors
//    → Returns real text chunks from your medical book
//    │
//    ▼
// generateMedicalResponse(question, context)
//    ├─ Try: HF Mistral-7B LLM (currently 404 — credits depleted)
//    └─ Fallback: Format and return the Pinecone context directly
//    │
//    ▼
// Structured response returned to chat UI