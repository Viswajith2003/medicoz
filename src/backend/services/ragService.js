const axios = require("axios");

// NOTE: You will need to add these to your .env file
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

/**
 * Retrieves relevant medical context from Pinecone vector database.
 * @param {string} query - The user's medical question.
 * @returns {Promise<string>} - A concatenated string of relevant context chunks.
 */
async function getRelevantContext(query) {
  try {
    // 1. Generate embedding for the query (using HuggingFace model)
    const embeddingResponse = await axios.post(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      { inputs: query },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );

    const queryEmbedding = embeddingResponse.data;

    // 2. Search Pinecone for similar chunks
    // Note: This assumes you have already created a Pinecone index and uploaded embeddings.
    const pineconeResponse = await axios.post(
      `https://${PINECONE_INDEX_NAME}.svc.${PINECONE_ENVIRONMENT}.pinecone.io/query`,
      {
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
      },
      { headers: { "Api-Key": PINECONE_API_KEY } }
    );

    const context = pineconeResponse.data.matches
      .map((match) => match.metadata.text)
      .join("\n\n");

    return context || "No relevant medical records found.";
  } catch (error) {
    console.error("Error retrieving context from Pinecone:", error.response?.data || error.message);
    return "";
  }
}

/**
 * Generates a medical response using Mistral 7B via Hugging Face.
 * @param {string} query - The user's question.
 * @param {string} context - The retrieved medical context.
 * @returns {Promise<string>} - The AI-generated medical response.
 */
async function generateMedicalResponse(query, context) {
  try {
    if (!context || context === "No relevant medical records found.") {
      return "Information not available in verified sources.";
    }

    const prompt = `
      You are a specialized medical AI assistant for MediCoz. 
      Answer the user's question STRICTLY based on the provided context from verified medical sources.
      If the information is not in the context, say: "Information not available in verified sources."
      Do not hallucinate or use outside knowledge.

      ---
      CONTEXT:
      ${context}

      ---
      USER QUESTION:
      ${query}

      ---
      RESPONSE:
    `;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
      {
        inputs: prompt,
        parameters: { max_new_tokens: 500, temperature: 0.1, top_p: 0.9 },
      },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );

    // Clean up the response (Mistral instructions model might return the prompt back)
    let aiResponse = response.data[0].generated_text;
    if (aiResponse.includes("RESPONSE:")) {
      aiResponse = aiResponse.split("RESPONSE:").pop().trim();
    }

    return aiResponse;
  } catch (error) {
    console.error("Error generating response from LLM:", error.response?.data || error.message);
    return "I'm sorry, I'm having trouble connecting to my medical database right now.";
  }
}

module.exports = { getRelevantContext, generateMedicalResponse };





// ragService.js

// This is the "brain" of your backend.
// It handles converting user questions into embeddings (via Hugging Face).
// It searches your Pinecone database for relevant medical chapters.
// It sends that context to the Mistral 7B model to generate a verified response