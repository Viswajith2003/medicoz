const axios = require('axios');
const pdf = require('pdf-parse');

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

/**
 * Processes a PDF buffer and uploads its contents to Pinecone.
 * @param {Buffer} buffer - The PDF file buffer.
 * @param {string} originalName - Original filename for tracking.
 * @returns {Promise<void>}
 */
async function processAndIngest(buffer, originalName) {
  console.log(`--- Starting Admin Ingestion for: ${originalName} ---`);
  
  // 1. Read PDF
  const data = await pdf(buffer);
  const fullText = data.text;
  console.log(`Successfully read PDF. Total characters: ${fullText.length}`);

  // 2. Chunking (Simple split by paragraphs)
  const chunks = fullText.split(/\n\n+/).filter(chunk => chunk.trim().length > 100);
  console.log(`Split into ${chunks.length} chunks.`);

  // 3. Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Processing chunk ${i+1}/${chunks.length}...`);

    try {
      // 3.1 Get embedding
      const embeddingResponse = await axios.post(
        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
        { inputs: chunk },
        { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
      );
      
      const embedding = embeddingResponse.data;

      // 3.2 Upsert to Pinecone
      await axios.post(
        `https://${PINECONE_INDEX_NAME}.svc.${PINECONE_ENVIRONMENT}.pinecone.io/vectors/upsert`,
        {
          vectors: [{
            id: `${originalName.replace(/\s+/g, '_')}_chunk_${i}`,
            values: embedding,
            metadata: { text: chunk, source: originalName }
          }]
        },
        { headers: { "Api-Key": PINECONE_API_KEY } }
      );
    } catch (error) {
      console.error(`Error processing chunk ${i} of ${originalName}:`, error.message);
      throw error; // Re-throw to handle in the route
    }
  }

  console.log(`--- Admin Ingestion Complete for: ${originalName} ---`);
}

module.exports = { processAndIngest };
