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
    const relevantMatches = data.matches.filter(match => match.score > 0.3);
    const context = relevantMatches
      .map((match) => match.metadata.text)
      .join("\n\n");

    console.log(`[RAG] Pinecone returned ${data.matches.length} matches, ${relevantMatches.length} above threshold.`);

    return {
      context: context || "",
      hasRelevantContent: relevantMatches.length > 0,
    };
  } catch (error) {
    console.error("Error retrieving context:", error.message);
    return { context: "", hasRelevantContent: false };
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
async function generateMedicalResponse(query, ragResult) {
  // ragResult can be an object { context, hasRelevantContent } or a plain string (legacy)
  const context = typeof ragResult === "object" ? ragResult.context : ragResult;
  const hasRelevantContent = typeof ragResult === "object" ? ragResult.hasRelevantContent : !!(ragResult && ragResult !== "No relevant medical records found.");

  // ── OUT-OF-SCOPE GUARD ──────────────────────────────────────────────────────
  // If no relevant content was found in the vector DB, return a friendly message
  // immediately — do NOT call the LLM to avoid hallucination.
  if (!hasRelevantContent || !context) {
    console.log("[RAG] No relevant content found — returning out-of-scope message.");
    return (
      "😔 Sorry, this topic is not covered in our available medical documents.\n\n" +
      "👉 I can only provide answers based on the specific clinical reference materials available in my knowledge base.\n\n" +
      "⚕️ For accurate advice on this subject, please consult a licensed healthcare professional."
    );
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
Answer the user's question using ONLY the provided medical context below.
If the provided context does NOT contain enough information to answer the question, respond EXACTLY with this message and nothing else:
"😔 Sorry, this topic is not covered in our available medical documents. For accurate advice, please consult a licensed healthcare professional."
Do NOT use outside knowledge. Do NOT hallucinate.

STRICT FORMATTING RULES (only when you have a real answer):
- Start with a short one-line summary of the answer.
- Then list each key point using the 👉 emoji at the start.
- Add a blank line between each 👉 point.
- End with: "⚕️ Always consult a licensed healthcare professional for clinical decisions."
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