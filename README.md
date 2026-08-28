# 🎓 Apex College - RAG-Based Information Chatbot

An AI-powered web application designed to help students and faculty quickly access college information (notices, academic calendars, fee structures, admissions, hostel rules, policies, and placements) through a conversational interface powered by **Retrieval-Augmented Generation (RAG)**.

Instead of relying solely on general LLM knowledge, the chatbot performs semantic vector similarity search against official uploaded college documents, generates grounded answers, and cites the **exact source document and page number**.

---

## 🌟 Key Features

- **Document Processing & Vectorization**:
  - Multi-format ingestion: **PDF**, **DOCX**, **TXT**, and **Markdown**.
  - Intelligent character chunking with configurable chunk sizes & overlap.
  - Persistent embeddings stored in **ChromaDB**.
- **Accurate RAG Question Answering**:
  - Semantic similarity query matching.
  - Zero-hallucination policy: If context is not found, the chatbot explicitly states: *"I couldn't find reliable information about this in the available college documents."*
  - Interactive **Source Citation Badges** (Document Title, Page Number, Relevance Score %) with deep-dive modal preview.
- **Student Experience**:
  - Conversational chat interface with suggested quick queries.
  - Chat history tracking, dialogue resumption, and management.
  - Message feedback mechanism (👍 / 👎).
- **Admin Management Dashboard**:
  - Real-time KPI telemetry (Total Documents, Vector Chunks, Users, Queries).
  - Document upload dropzone with processing status badges (`Processing`, `Ready`, `Failed`).
  - ChromaDB Chunk Inspector & Document deletion.
  - **1-Click Sample Knowledge Base Loader** with 5 pre-configured college handbooks.
- **Flexible AI Engine & API Integrations**:
  - Seamlessly integrates with **Google Gemini API** (`gemini-1.5-flash`), **OpenAI API** (`gpt-4o-mini`), and **Groq**.
  - Built-in **Local Grounded Synthesizer** so the app answers with precise facts, fees, and dates even without API keys!
- **9 Bonus Features (Implemented)**:
  1. 🏷️ **Department-wise Knowledge Base & Filtering**: Filter queries & documents by `Admissions`, `CSE`, `Hostel`, `Placements`, `General`.
  2. 🔍 **Hybrid Search & Re-ranking**: Combines 70% ChromaDB semantic cosine similarity + 30% lexical keyword overlap.
  3. 🎯 **Relevance Confidence Scores**: Displays `High`, `Medium`, or `Low` match badges with % scores.
  4. 🌐 **Multilingual Support**: Switch between English, Hindi (हिंदी), Telugu (తెలుగు), Spanish (Español), and French (Français).
  5. 🎙️ **Voice Input (STT)**: Web Speech API microphone dictation in the chat input.
  6. 🔊 **Voice Output (TTS)**: Text-to-speech speaker button on all assistant responses.
  7. 💡 **Dynamic Smart Follow-ups**: Contextual follow-up question chips returned with every response.
  8. 📥 **Conversation Export**: 1-click export of chat dialogues to formatted `.txt` with timestamps and citations.
  9. ❓ **AI-Generated FAQs Page & Admin Satisfaction Telemetry**: Dedicated `/faqs` browser + Admin 👍 % satisfaction analytics.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               React + Vite Frontend                    │
│   (Chat Window, Source Modal, Admin Dashboard)         │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (JWT Auth)
┌───────────────────────────▼────────────────────────────┐
│                  FastAPI Backend                       │
│  ├─ Auth Service (JWT + Bcrypt)                        │
│  ├─ Document Parser (PyPDF, docx, txt)                 │
│  ├─ Semantic Chunker & Vector Store Manager            │
│  └─ RAG Context Assembler & LLM Engine                 │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼─────────────┐   ┌─────────▼──────────────┐
│    SQLite / PostgreSQL    │   │  ChromaDB Vector Store │
│ (Users, Conversations,    │   │ (Document Embeddings & │
│  Messages, Metadata)      │   │  Metadata Chunks)      │
└───────────────────────────┘   └────────────────────────┘
```

---

## 🚀 Quick Start & Local Run Guide

### 1. Prerequisites
- **Python**: Version 3.11 or higher
- **Node.js**: Version 18 or higher (with `npm`)

---

### 2. Backend Setup

Open a terminal in the project directory:

```bash
# Navigate to the backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Configure environment variables
# Copy .env.example to .env and add your OpenAI or Gemini key if desired:
# cp .env.example .env

# Run the FastAPI server
python run.py
```

> **Backend URL:** [http://localhost:8000](http://localhost:8000)  
> **Interactive Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)  
> **Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 3. Frontend Setup

Open a second terminal window in the project root:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

> **Frontend Web App:** [http://localhost:5173](http://localhost:5173)

---

## 🔑 Default Login Credentials

The database automatically initializes with two pre-configured accounts for testing:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@college.edu` | `admin123` | Upload/delete documents, view vector chunks, admin dashboard stats |
| **Student** | `student@college.edu` | `student123` | Ask college queries, view sources, chat history, submit feedback |

*(You can also use the 1-click **Quick Demo Login** buttons on the Login page!)*

---

## 📚 Pre-Seeded Sample College Documents

The application includes 5 comprehensive official college documents in `backend/sample_data/`:
1. `Academic_Calendar_2026_27.txt` — Exam schedules, mid-term dates, holidays, registration deadlines.
2. `Fee_Structure_and_Scholarships.txt` — Tuition fees per branch, hostel fees, Chairman's Merit Scholarship.
3. `Admission_Guidelines_and_Eligibility.txt` — 10+2 PCM criteria, JEE/CET cutoffs, required verification documents.
4. `Hostel_Rules_and_Facilities.txt` — Curfew timings (9:30 PM), dining mess hours, anti-ragging policies.
5. `Placement_Policy_and_Statistics.txt` — Minimum CGPA (6.5), top recruiters (Google, Microsoft, Amazon), average CTC (₹9.2 LPA).

---

## 🧪 Example Test Questions for Evaluation

| Category | Example Question | Expected Source Cited |
| :--- | :--- | :--- |
| **Fees** | *"What is the annual tuition fee for CSE and AI & DS students?"* | `Fee Structure And Scholarships, Page 1` |
| **Exams** | *"When are the Autumn Semester theory examinations?"* | `Academic Calendar 2026 27, Page 1` |
| **Admissions** | *"What documents are required during physical reporting for admission?"* | `Admission Guidelines And Eligibility, Page 2` |
| **Hostel** | *"What are the hostel curfew hours and dining mess timings?"* | `Hostel Rules And Facilities, Page 2` |
| **Placements** | *"What is the average CTC and minimum CGPA required for placements?"* | `Placement Policy And Statistics, Page 1-2` |
| **Out of Scope** | *"What is the recipe for chocolate cake in the cafeteria?"* | Refusal without hallucination: *"I couldn't find reliable information about this in the available college documents."* |

---

## 📡 API Reference Overview

### Authentication
- `POST /api/auth/register` — Create a new student or admin account
- `POST /api/auth/login` — Authenticate and receive JWT bearer token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/logout` — Invalidate user session

### Documents & Knowledge Base
- `POST /api/documents/upload` — Upload PDF/DOCX/TXT document (Admin only)
- `GET /api/documents` — List all documents and indexing status
- `GET /api/documents/{id}/chunks` — Inspect vector chunks in ChromaDB
- `DELETE /api/documents/{id}` — Delete document and remove ChromaDB embeddings
- `POST /api/documents/seed-samples` — 1-click ingest 5 sample college documents

### Chat & Conversations
- `POST /api/chat` — Execute RAG query against ChromaDB & return answer + sources
- `POST /api/chat/feedback` — Submit thumbs up/down rating on assistant answer
- `GET /api/conversations` — List current user's past dialogues
- `GET /api/conversations/{id}` — Retrieve full message history with citations
- `DELETE /api/conversations/{id}` — Delete a dialogue

### Admin Telemetry
- `GET /api/admin/stats` — KPI analytics (Total documents, chunks, conversations, users)
- `GET /api/admin/users` — List registered users and roles

---

## 🛠️ Tech Stack Summary

- **Frontend**: React 18, Vite, Lucide React Icons, Axios, Modern Glassmorphic CSS Design System.
- **Backend**: Python FastAPI, Uvicorn, SQLAlchemy, Pydantic v2.
- **Vector Store**: ChromaDB (HNSW Cosine Similarity Indexing).
- **Parsers**: PyPDF (PDFs), python-docx (Word documents), custom plain-text segmenter.
- **Authentication**: JWT Bearer Tokens with Passlib & Bcrypt encryption.
- **Storage**: SQLite database (Production-ready switchable to PostgreSQL via `DATABASE_URL`).

---

## 🚢 Deployment
For complete production deployment instructions with **Docker Compose**, **Cloud (Render / Railway / Vercel)**, or **VPS (Nginx + Systemd)**, see:
👉 **[DEPLOYMENT.md](file:///c:/Users/KALLURU/Desktop/Automation_AI/DEPLOYMENT.md)**

---

## 📜 License
Educational and demonstration project for Apex Institute of Technology & Management.
