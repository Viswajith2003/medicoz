const { PDFParse } = require('pdf-parse');

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;

// Helper for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Lazy-load the local embedding pipeline (downloads model once on first run)
let embeddingPipeline = null;
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    console.log('Loading local embedding model (BAAI/bge-small-en-v1.5)...');
    console.log('First run: model will download ~120MB. This is a one-time setup.');
    const { pipeline } = await import('@xenova/transformers');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');
    console.log('Local embedding model loaded successfully!');
  }
  return embeddingPipeline;
}

/**
 * Generate an embedding vector for a text string using local model.
 */
async function getLocalEmbedding(text) {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Robust fetch with retries for Pinecone
 */
async function fetchWithRetry(url, options, retries = 5, backoff = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 || response.status === 503 || response.status === 504) {
        const waitMs = backoff * (i + 1);
        console.log(`HTTP ${response.status}. Waiting ${waitMs}ms then retrying (${i + 1}/${retries})...`);
        await sleep(waitMs);
        continue;
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Network error (${err.message}). Retrying in ${backoff}ms...`);
      await sleep(backoff);
      backoff *= 2;
    }
  }
}

/**
 * Processes a PDF buffer and uploads its contents to Pinecone.
 * Uses LOCAL embeddings (no HuggingFace API quota needed).
 * @param {Buffer} buffer - The PDF file buffer.
 * @param {string} originalName - Original filename for tracking.
 */
async function processAndIngest(buffer, originalName) {
  console.log(`--- Starting Admin Ingestion v2.0 (Local Embeddings) for: ${originalName} ---`);

  if (!PINECONE_API_KEY || !PINECONE_HOST) {
    throw new Error('Missing PINECONE_API_KEY or PINECONE_HOST in .env file.');
  }

  // 1. Read PDF
  let fullText = '';
  try {
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    fullText = result.text;
  } catch (pdfError) {
    throw new Error('Failed to parse PDF: ' + pdfError.message);
  }

  console.log(`PDF read. Total characters: ${fullText.length}`);

  // 2. Chunking
  const rawChunks = fullText.split(/\n\n+/).filter(c => c.trim().length > 50);
  const chunks = [];
  for (const raw of rawChunks) {
    if (raw.length > 2000) {
      chunks.push(...(raw.match(/.{1,2000}/gs) || []));
    } else {
      chunks.push(raw);
    }
  }
  console.log(`Split into ${chunks.length} chunks.`);

  // 3. Pre-load model before the loop
  await getEmbeddingPipeline();

  const PINECONE_UPSERT_BATCH = 100;

  // 4. Process in batches
  for (let batchStart = 0; batchStart < chunks.length; batchStart += PINECONE_UPSERT_BATCH) {
    const currentBatch = chunks.slice(batchStart, batchStart + PINECONE_UPSERT_BATCH);
    const batchNum = Math.floor(batchStart / PINECONE_UPSERT_BATCH) + 1;
    const totalBatches = Math.ceil(chunks.length / PINECONE_UPSERT_BATCH);
    console.log(`Processing batch ${batchNum}/${totalBatches} (${currentBatch.length} chunks)...`);

    try {
      // 4.1 Generate embeddings LOCALLY (sequential to avoid memory issues)
      const vectors = [];
      for (let j = 0; j < currentBatch.length; j++) {
        const cleanChunk = currentBatch[j].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
        if (!cleanChunk) continue;

        const values = await getLocalEmbedding(cleanChunk);

        vectors.push({
          id: `${originalName.replace(/\s+/g, '_')}_chunk_${batchStart + j}`,
          values,
          metadata: { text: cleanChunk, source: originalName }
        });
      }

      if (vectors.length === 0) continue;

      // 4.2 Bulk upsert to Pinecone
      const pineconeResponse = await fetchWithRetry(
        `https://${PINECONE_HOST}/vectors/upsert`,
        {
          method: 'POST',
          headers: {
            'Api-Key': PINECONE_API_KEY,
            'Content-Type': 'application/json',
            'Host': PINECONE_HOST
          },
          body: JSON.stringify({ vectors })
        }
      );

      if (!pineconeResponse.ok) {
        const errText = await pineconeResponse.text();
        throw new Error(`Pinecone error ${pineconeResponse.status}: ${errText}`);
      }

      const progress = Math.min(batchStart + PINECONE_UPSERT_BATCH, chunks.length);
      console.log(`✓ Batch ${batchNum}/${totalBatches} complete. Progress: ${progress}/${chunks.length}`);

    } catch (error) {
      console.error(`--- ERROR in batch ${batchNum} ---`, error.message);
      throw error;
    }
  }

  console.log(`--- Admin Ingestion Complete for: ${originalName} ---`);
  return chunks.length; // Return chunk count for record-keeping
}

module.exports = { processAndIngest };


// The PDF-to-Pinecone pipeline. Called when you upload a PDF.

// PDF File
//    │
//    ▼
// pdf-parse → Extract raw text (6.5M chars)
//    │
//    ▼
// Split into ~4000 chunks (max 2000 chars each)
//    │
//    ▼
// For each batch of 100 chunks:
//    ├─ getLocalEmbedding() × 100 chunks (local AI model)
//    │  → converts text to 384-dimensional vector
//    └─ Pinecone bulk upsert (1 network call for 100 vectors)
//    │
//    ▼
// Done — medical knowledge is now searchable