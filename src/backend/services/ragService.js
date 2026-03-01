// ragService.js
// Uses local @xenova/transformers for embeddings (free, no API cost).
// Uses Hugging Face router for LLM with graceful fallback.

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

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

  const topParagraphs = paragraphs.slice(0, 4); // Show up to 4 relevant paragraphs

  return [
    `📚 **Based on your medical reference book:**`,
    ``,
    ...topParagraphs.map(p => `> ${p}`),
    ``,
    `---`,
    `*Source: Physical Rehabilitation, 6th Edition (O'Sullivan). For clinical decisions, always consult a licensed healthcare professional.*`
  ].join("\n");
}

/**
 * Generates a medical response using Hugging Face LLM.
 * Falls back to returning the retrieved context directly if LLM is unavailable.
 */
async function generateMedicalResponse(query, context) {
  if (!context || context === "No relevant medical records found.") {
    return "❓ I couldn't find specific information about that topic in our verified medical sources. Please consult a healthcare professional for accurate advice.";
  }

  // Try LLM
  try {
    const prompt = `<s>[INST] You are MediCoz, a specialized medical AI assistant.
Answer the user's question concisely using ONLY the provided medical context.
If the context does not contain the answer, say so clearly.

MEDICAL CONTEXT:
${context.substring(0, 2000)}

QUESTION: ${query} [/INST]`;

    const llmResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 400, temperature: 0.1, top_p: 0.9, return_full_text: false },
        })
      }
    );

    if (llmResponse.ok) {
      const data = await llmResponse.json();
      const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
      if (text && text.trim().length > 10) {
        console.log("[RAG] LLM response used successfully.");
        return text.trim();
      }
    } else {
      const errBody = await llmResponse.text();
      console.warn(`[RAG] LLM returned HTTP ${llmResponse.status}. Falling back to context.`);
    }
  } catch (llmError) {
    console.warn("[RAG] LLM call failed. Falling back to context:", llmError.message);
  }

  // Graceful fallback: return the Pinecone context formatted as a structured response
  console.log("[RAG] Using formatted context fallback.");
  return formatContextAsResponse(query, context);
}

module.exports = { getRelevantContext, generateMedicalResponse };