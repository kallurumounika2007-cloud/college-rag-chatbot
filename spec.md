# RAG-Based College Information Chatbot

## Project Specification Sheet

### 1. Project Overview

The **RAG-Based College Information Chatbot** is an AI-powered web application designed to help students quickly access college-related information through a conversational interface.

Instead of answering questions solely based on the knowledge of a Large Language Model (LLM), the system uses **Retrieval-Augmented Generation (RAG)**. It searches uploaded college documents such as notices, PDFs, academic calendars, fee structures, policies, and FAQs, retrieves relevant information, and uses that information to generate accurate answers.

The chatbot will also display the **source document or reference** used to generate each answer.

---

### 2. Problem Statement

Students often need information about admissions, courses, examinations, fees, scholarships, hostels, placements, and college policies. This information is usually distributed across multiple PDFs, notices, websites, and documents.

Searching through these resources manually can be time-consuming and confusing.

The proposed system provides a centralized AI-powered assistant that allows students to ask questions in natural language and receive answers based on the official documents available in the college knowledge base.

---

### 3. Project Objectives

The main objectives of the project are:

* To provide students with quick access to college-related information.
* To implement a working Retrieval-Augmented Generation pipeline.
* To retrieve relevant information from uploaded documents using semantic search.
* To generate answers grounded in the retrieved documents.
* To display sources and references for generated answers.
* To allow administrators to manage the chatbot's knowledge base.
* To provide a user-friendly frontend connected to a functional backend.

---

### 4. Target Users

#### Students

Students can:

* Register and log in.
* Ask questions related to the college.
* View AI-generated answers.
* View document sources used for answers.
* Access their previous chat conversations.

#### Administrators

Administrators can:

* Upload college documents.
* View uploaded documents.
* Update or replace documents.
* Delete outdated documents.
* Manage the knowledge base.

---

### 5. Functional Requirements

#### 5.1 User Authentication

The system should provide:

* User registration.
* User login and logout.
* Secure password handling.
* Role-based access for students and administrators.

#### 5.2 Chat Interface

The application should provide a conversational interface where users can:

* Enter questions in natural language.
* Receive AI-generated responses.
* View previous messages.
* Continue conversations using chat history.

Example questions:

> What is the fee structure for CSE students?

> When are the semester examinations?

> What documents are required for admission?

#### 5.3 Document Upload and Management

Administrators should be able to:

* Upload PDF and document files.
* View uploaded documents.
* Delete documents.
* Replace outdated documents.

Supported document types for the initial version may include:

* PDF
* DOCX
* TXT

#### 5.4 Document Processing

When a document is uploaded, the system should perform the following operations:

1. Extract text from the document.
2. Clean and preprocess the extracted text.
3. Divide the text into smaller chunks.
4. Generate embeddings for every chunk.
5. Store embeddings and document metadata in the vector database.

Each chunk should contain metadata such as:

* Document name
* Document ID
* Page number, where available
* Upload date
* Chunk number

#### 5.5 Semantic Search

When a user asks a question:

1. The question is converted into an embedding.
2. The system searches the vector database.
3. The most relevant document chunks are retrieved.
4. Relevant chunks are provided to the LLM as context.

The search should retrieve only the most relevant information instead of sending all documents to the LLM.

#### 5.6 RAG-Based Answer Generation

The chatbot must generate answers based primarily on the retrieved context.

The system prompt should instruct the AI to:

* Answer using the provided context.
* Avoid inventing information.
* Clearly state when information is unavailable.
* Provide a concise and understandable response.

#### 5.7 Source Display

Every answer generated using retrieved information should display the relevant source.

Example:

**Answer:** The semester examinations are scheduled to begin on 10 November.

**Source:** Academic Calendar 2026–27, Page 4

#### 5.8 Unknown Question Handling

If the system cannot find relevant information, it should respond clearly.

Example:

> "I couldn't find reliable information about this in the available college documents."

The system should not generate unsupported or hallucinated answers.

#### 5.9 Chat History

The system should store:

* User ID
* Conversation ID
* User messages
* Assistant responses
* Message timestamps

Users should be able to revisit previous conversations.

---

## 6. Required RAG Pipeline

The core architecture of the project will follow this flow:

**College Documents**
↓
**Text Extraction**
↓
**Text Cleaning and Chunking**
↓
**Embedding Generation**
↓
**Vector Database Storage**
↓
**User Question**
↓
**Question Embedding**
↓
**Similarity Search**
↓
**Relevant Document Chunks**
↓
**LLM with Retrieved Context**
↓
**Final Answer + Source References**

---

## 7. Suggested System Architecture

The application will consist of the following major components:

### Frontend

Responsible for:

* User interface.
* Authentication screens.
* Chat interface.
* Document upload interface.
* Admin dashboard.
* Source display.

### Backend API

Responsible for:

* Authentication and authorization.
* Document upload handling.
* Document processing.
* RAG pipeline.
* Communication with the vector database.
* Communication with the LLM.
* Chat history management.

### Vector Database

Responsible for:

* Storing document embeddings.
* Performing semantic similarity searches.
* Returning relevant document chunks.

### Main Database

Responsible for storing:

* User information.
* User roles.
* Document metadata.
* Conversations.
* Chat messages.

### LLM Service

Responsible for generating natural-language answers using:

* The user's question.
* Retrieved document context.
* System instructions.

---

## 8. Suggested Technology Stack

| Component           | Suggested Technology                |
| ------------------- | ----------------------------------- |
| Frontend            | React / Next.js                     |
| Backend             | Python FastAPI                      |
| Authentication      | JWT / Clerk / Firebase Auth         |
| Main Database       | PostgreSQL                          |
| Vector Database     | ChromaDB / Pinecone / pgvector      |
| Embeddings          | OpenAI Embeddings                   |
| LLM                 | OpenAI API                          |
| Document Processing | PyPDF / PyMuPDF / LangChain loaders |
| File Storage        | Local storage / Cloudinary / AWS S3 |
| Deployment          | Vercel + Render/Railway             |

### Recommended Beginner-Friendly Stack

For a first implementation:

**React + FastAPI + PostgreSQL + ChromaDB + OpenAI API**

This stack keeps the architecture understandable while still implementing a genuine RAG system.

---

## 9. Database Design

### Users Table

| Field         | Description            |
| ------------- | ---------------------- |
| user_id       | Unique user identifier |
| name          | User name              |
| email         | User email             |
| password_hash | Encrypted password     |
| role          | Student or Admin       |
| created_at    | Account creation date  |

### Documents Table

| Field       | Description                |
| ----------- | -------------------------- |
| document_id | Unique document identifier |
| title       | Document name              |
| file_path   | Storage location           |
| uploaded_by | Admin ID                   |
| uploaded_at | Upload timestamp           |
| status      | Active / Deleted           |

### Conversations Table

| Field           | Description            |
| --------------- | ---------------------- |
| conversation_id | Unique conversation ID |
| user_id         | Associated user        |
| title           | Conversation title     |
| created_at      | Creation timestamp     |

### Messages Table

| Field           | Description             |
| --------------- | ----------------------- |
| message_id      | Unique message ID       |
| conversation_id | Associated conversation |
| sender          | User or Assistant       |
| content         | Message content         |
| created_at      | Message timestamp       |

---

## 10. API Requirements

### Authentication APIs

* `POST /register`
* `POST /login`
* `POST /logout`

### Chat APIs

* `POST /chat`
* `GET /conversations`
* `GET /conversations/{id}`

### Document APIs

* `POST /documents/upload`
* `GET /documents`
* `DELETE /documents/{id}`

### Admin APIs

* `GET /admin/documents`
* `POST /admin/documents`
* `DELETE /admin/documents/{id}`

---

## 11. Core RAG Logic

The backend should follow this general process:

### Document Indexing

```text
Upload Document
      ↓
Extract Text
      ↓
Split into Chunks
      ↓
Generate Embeddings
      ↓
Store Embeddings + Metadata
```

### Question Answering

```text
User Question
      ↓
Generate Question Embedding
      ↓
Search Vector Database
      ↓
Retrieve Top Relevant Chunks
      ↓
Check Relevance
      ↓
Send Context + Question to LLM
      ↓
Generate Answer
      ↓
Return Answer + Sources
```

---

## 12. Non-Functional Requirements

The system should aim for:

### Performance

* Fast document search.
* Reasonable chatbot response time.
* Efficient retrieval of relevant chunks.

### Security

* Secure authentication.
* Protected admin routes.
* Secure handling of API keys.
* Validation of uploaded files.

### Reliability

* The chatbot should gracefully handle API or database failures.
* The system should avoid answering when reliable context is unavailable.

### Scalability

* The architecture should allow additional documents and users to be added later.

### Usability

* Simple and intuitive chat interface.
* Clear source references.
* Mobile-friendly design.

---

## 13. Project Pages

### Student Pages

1. Login / Registration Page
2. Chatbot Page
3. Chat History Page
4. Profile Page

### Admin Pages

1. Admin Dashboard
2. Document Upload Page
3. Document Management Page
4. Document Processing Status Page

---

## 14. Bonus Features for Future Development

After completing the core project, the following features can be added:

* Department-wise knowledge bases.
* Multiple document collections.
* Confidence or relevance scores.
* Source highlighting.
* Multilingual support.
* Voice input and voice responses.
* OCR for scanned documents.
* Hybrid keyword and semantic search.
* Document re-ranking.
* Suggested questions.
* User feedback using 👍 / 👎.
* AI-generated FAQs.
* Streaming responses.
* Analytics dashboard.
* Document version management.

---

## 15. Project Scope

### Phase 1 – Minimum Viable Product

* User authentication.
* PDF document upload.
* Text extraction and chunking.
* Embedding generation.
* Vector database integration.
* Semantic search.
* RAG chatbot.
* Source display.
* Unknown-question handling.

### Phase 2 – Full Application

* Chat history.
* Admin dashboard.
* Multiple document management.
* Database integration.
* Improved UI and error handling.

### Phase 3 – Advanced Features

* OCR.
* Multilingual support.
* Voice interaction.
* Re-ranking.
* Analytics.
* Feedback system.

---

## 16. Success Criteria

The project will be considered successful if:

* Users can upload and process college documents.
* Document content is converted into searchable vector embeddings.
* The chatbot retrieves relevant information before generating an answer.
* Answers are grounded in uploaded documents.
* Sources are displayed with answers.
* The chatbot appropriately handles questions outside the knowledge base.
* Authentication and admin document management work correctly.
* The frontend and backend are fully integrated.
* The application is successfully deployed and accessible online.

---

## 17. Final Deliverable

The final system will be a deployed web application that acts as an intelligent college information assistant.

The application will demonstrate a complete Retrieval-Augmented Generation workflow by connecting document processing, embeddings, semantic search, a vector database, an LLM, user authentication, database storage, and a modern web interface into one functional system.
