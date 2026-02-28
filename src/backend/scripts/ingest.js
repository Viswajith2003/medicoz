/**
 * DOCUMENT INGESTION SCRIPT (Skeleton)
 * This script is responsible for:
 * 1. Reading your medical PDFs.
 * 2. Splitting them into manageable chunks.
 * 3. Generating embeddings for each chunk.
 * 4. Storing the chunks and embeddings in Pinecone.
 * 
 * TO RUN THIS:
 * npm install pdf-parse @pinecone-database/pinecone
 */

const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
require('dotenv').config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const FILE_PATH = './medical_data/book.pdf'; // Path to your medical file

async function ingest() {
  console.log("--- Starting Medical Data Ingestion ---");
  
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`Error: File ${FILE_PATH} not found. Please create a folder 'medical_data' and place your PDF inside.`);
    return;
  }

  // 1. Read PDF
  const dataBuffer = fs.readFileSync(FILE_PATH);
  const data = await pdf(dataBuffer);
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

      // 3.2 Upsert to Pinecone (Simplified via Axios)
      await axios.post(
        `https://${PINECONE_INDEX_NAME}.svc.${PINECONE_ENVIRONMENT}.pinecone.io/vectors/upsert`,
        {
          vectors: [{
            id: `chunk_${i}`,
            values: embedding,
            metadata: { text: chunk }
          }]
        },
        { headers: { "Api-Key": PINECONE_API_KEY } }
      );
    } catch (error) {
      console.error(`Error processing chunk ${i}:`, error.message);
    }
  }

  console.log("--- Ingestion Complete ---");
}

ingest();
