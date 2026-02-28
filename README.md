# MediCoz: AI-Enhanced Medical Chatbot Using RAG

## Overview
MediCoz is a specialized AI-powered medical chatbot that leverages **Retrieval-Augmented Generation (RAG)** to provide accurate, verified medical information. Unlike standard AI models that might hallucinate or pull unverified data from the internet, MediCoz strictly answers based on trusted medical textbooks, research documents, and verified PDFs.

## 🏗️ Architecture
The system follows a robust RAG architecture to ensure medical accuracy:
- **Data Source Layer**: Curated medical textbooks and verified research documents.
- **Processing Engine**: Converts text into chunks, generates embeddings, and indexes them.
- **Vector Database (Pinecone)**: Performs high-speed similarity searches to retrieve the most relevant medical context.
- **LLM Layer**: Utilizes the **Mistral 7B** model via Hugging Face API for structured response generation.

## 🔴 Problem Statement
- **Information Overload**: Too many conflicting results when searching medical queries online.
- **Accuracy Risks**: Unverified or misleading information leading to dangerous self-diagnosis.
- **Hallucinations**: standard LLMs may provide confident but factually incorrect medical advice.

## ✅ Proposed Solution
MediCoz solves these issues by creating a **closed-loop knowledge base**. If the information is not present in its verified document set, the system will explicitly state: *"Information not available in verified sources."*

## 🛠️ Tech Stack
- **Frontend**: Next.js (Modern, responsive Chat UI)
- **Backend**: Express.js (Secure API & Business Logic)
- **Database**: 
  - **MongoDB**: Authentication & Chat History storage.
  - **Pinecone**: Vector Database for RAG context retrieval.
- **AI/ML**: 
  - **Mistral 7B**: Core Large Language Model.
  - **Hugging Face API**: Model hosting and inference.
  - **Embeddings**: Text-to-vector conversion for medical documents.

## 🔄 Complete Working Flow
1. **User Query**: User asks a question via the Next.js frontend.
2. **Backend Processing**: Express.js receives the request and converts the query into an embedding.
3. **Context Retrieval**: The system searches Pinecone for the most similar chunks from verified medical PDFs.
4. **Augmented Prompting**: The retrieved context + the original question are sent to the Mistral 7B model.
5. **Verified Response**: The LLM generates a response strictly tied to the provided context.
6. **Persistence**: The chat history is saved to MongoDB for future reference.

## 🌟 Key Advantages
- **High Accuracy**: Answers are grounded in real medical literature.
- **Reduced Hallucinations**: The model is restricted to the provided documents.
- **Secure**: User data and chat history are protected via secure authentication.
- **Controlled Knowledge**: No random internet data is used in the generation.

## ⚠️ Limitations
- **Knowledge Scope**: Only answers based on uploaded documents.
- **Maintenance**: Requires periodic updates to the document library.
- **Professional Advice**: This is an informational tool and **not a replacement for professional medical consultation**.

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- MongoDB (Running locally or on Atlas)
- Pinecone API Key
- Hugging Face API Key

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Project
You need to run both the frontend and the backend:

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
npm run backend
```

---
*MediCoz: Your Trusted Partner in Smart, Seamless Healthcare.*
