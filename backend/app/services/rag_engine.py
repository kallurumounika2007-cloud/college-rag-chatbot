import logging
import json
import re
import requests
from typing import Dict, Any, List, Optional
from app.config import settings
from app.services.vector_store import vector_store_service
from app.schemas import SourceItem

logger = logging.getLogger(__name__)

UNKNOWN_RESPONSE = "I couldn't find reliable information about this in the available college documents. Please consult the college administration office or check official notices for more details."

RAG_SYSTEM_PROMPT = """You are the official AI Information Assistant for Apex College. Your role is to assist students, applicants, and staff by answering questions accurately based solely on the provided college document excerpts.

CRITICAL INSTRUCTIONS:
1. Answer the question using ONLY the provided Document Context below.
2. Do NOT invent, assume, or hallucinate any dates, fees, policies, requirements, or facts not explicitly stated in the context.
3. If the provided context does not contain enough information to answer the question reliably, respond EXACTLY with:
"I couldn't find reliable information about this in the available college documents."
4. Be polite, clear, well-structured, and concise. Use clean markdown formatting (bolding, lists, tables) for readability.
5. In your answer, cite the specific document name and page number when referring to facts.
6. If the user requested a specific response language, answer in that language while keeping official proper nouns and amounts intact.
"""

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "te": "Telugu (తెలుగు)",
    "es": "Spanish (Español)",
    "fr": "French (Français)"
}

def generate_followup_suggestions(query: str, context_chunks: List[Dict[str, Any]]) -> List[str]:
    """Generate 2-3 contextual follow-up questions."""
    q_lower = query.lower()
    if any(k in q_lower for k in ["fee", "tuition", "cost", "scholarship", "money", "payment"]):
        return [
            "What are the eligibility criteria for the Chairman's Merit Scholarship?",
            "What is the fee for AC vs Non-AC hostel rooms?",
            "What is the deadline for semester fee payment?"
        ]
    elif any(k in q_lower for k in ["exam", "calendar", "semester", "holiday", "schedule", "attendance"]):
        return [
            "What is the minimum attendance requirement to appear for examinations?",
            "When are the Spring Semester theory exams scheduled?",
            "When does the annual technical fest (TECHNOVA) take place?"
        ]
    elif any(k in q_lower for k in ["admission", "eligibility", "documents", "cutoff", "quota", "seat"]):
        return [
            "What are the mandatory documents required for physical verification?",
            "What is the cancellation and tuition fee refund policy?",
            "What is the seat matrix for CSE and AI & Data Science?"
        ]
    elif any(k in q_lower for k in ["hostel", "room", "mess", "food", "curfew", "warden"]):
        return [
            "What are the hostel evening curfew and night-out pass rules?",
            "What are the daily mess dining hours for all meals?",
            "What is the anti-ragging helpline and zero tolerance policy?"
        ]
    elif any(k in q_lower for k in ["placement", "job", "salary", "package", "company", "recruit", "internship", "ctc"]):
        return [
            "What was the highest international and domestic package offered?",
            "What companies visit the campus for Tier-1 placements?",
            "What is the minimum CGPA required to register for placements?"
        ]
    else:
        return [
            "What is the fee structure for CSE students?",
            "When are the end-semester examinations?",
            "What are the hostel curfew timings?"
        ]

def generate_rag_response_with_gemini(query: str, context_chunks: List[Dict[str, Any]], language: str = "en") -> str:
    """Generate response using Google Gemini API."""
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # Try gemini-1.5-flash or gemini-pro
    model_name = settings.GEMINI_MODEL if settings.GEMINI_MODEL else "gemini-1.5-flash"
    model = genai.GenerativeModel(model_name)

    context_str = "\n\n---\n\n".join([
        f"[Document: {c['document_title']} | Page: {c['page_number']} | Dept: {c.get('department', 'General')}]\n{c['content']}"
        for c in context_chunks
    ])

    lang_instruction = f" Respond in {LANGUAGE_NAMES.get(language, 'English')}." if language != "en" else ""
    full_prompt = f"{RAG_SYSTEM_PROMPT}{lang_instruction}\n\nDocument Context:\n{context_str}\n\nUser Question: {query}\n\nAnswer:"
    
    response = model.generate_content(full_prompt)
    if response and response.text:
        return response.text.strip()
    raise ValueError("Empty response from Gemini")

def generate_rag_response_with_openai(query: str, context_chunks: List[Dict[str, Any]], language: str = "en") -> str:
    """Generate response using OpenAI API or OpenAI-compatible endpoint (Groq/Ollama)."""
    import openai
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    context_str = "\n\n---\n\n".join([
        f"[Document: {c['document_title']} | Page: {c['page_number']} | Dept: {c.get('department', 'General')} | Relevance: {int(c['score']*100)}%]\n{c['content']}"
        for c in context_chunks
    ])

    lang_instruction = f" Respond in {LANGUAGE_NAMES.get(language, 'English')}." if language != "en" else ""

    messages = [
        {"role": "system", "content": f"{RAG_SYSTEM_PROMPT}{lang_instruction}"},
        {"role": "user", "content": f"Document Context:\n{context_str}\n\nUser Question: {query}\n\nPlease provide a clear, accurate, and grounded answer citing the source document:"}
    ]

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL or "gpt-4o-mini",
        messages=messages,
        temperature=0.1,
        max_tokens=700
    )
    return response.choices[0].message.content.strip()

def generate_local_grounded_response(query: str, context_chunks: List[Dict[str, Any]], language: str = "en") -> str:
    """
    Intelligent deterministic RAG synthesizer.
    Extracts relevant paragraphs and structured sections directly from retrieved source chunks.
    """
    if not context_chunks:
        return UNKNOWN_RESPONSE

    stop_words = {"what", "is", "the", "for", "are", "when", "how", "to", "in", "and", "a", "an", "of", "on", "can", "i", "do", "does", "where", "which", "tell", "me", "about"}
    query_tokens = [w.lower() for w in re.findall(r'\b\w+\b', query) if w.lower() not in stop_words and len(w) > 2]
    
    extracted_blocks = []
    seen_blocks = set()

    for chunk in context_chunks:
        doc_title = chunk.get("document_title", "Official Record")
        page_num = chunk.get("page_number", 1)
        content = chunk.get("content", "")

        # Split into logical sections/paragraphs
        paragraphs = [p.strip() for p in re.split(r'\n{2,}', content) if len(p.strip()) > 30]
        
        for p in paragraphs:
            p_lower = p.lower()
            overlap_count = sum(1 for token in query_tokens if token in p_lower)
            
            # Key matching criteria
            if overlap_count > 0 and p not in seen_blocks:
                seen_blocks.add(p)
                extracted_blocks.append({
                    "text": p,
                    "overlap": overlap_count,
                    "doc": doc_title,
                    "page": page_num
                })

    if not extracted_blocks:
        # Fallback to the top chunk's content directly
        top_chunk = context_chunks[0]
        return f"Based on the official college records (**{top_chunk.get('document_title', 'College Record')}**, Page {top_chunk.get('page_number', 1)}):\n\n{top_chunk.get('content', '')[:600]}\n\n*Please refer to the source reference below for complete details.*"

    extracted_blocks.sort(key=lambda x: x["overlap"], reverse=True)
    top_blocks = extracted_blocks[:3]

    main_doc = top_blocks[0]["doc"]
    main_page = top_blocks[0]["page"]

    formatted_sections = []
    for item in top_blocks:
        cleaned_text = item["text"].strip()
        formatted_sections.append(f"**From {item['doc']} (Page {item['page']}):**\n{cleaned_text}")

    body = "\n\n".join(formatted_sections)
    return f"Here is the official information from **{main_doc}** (Page {main_page}):\n\n{body}\n\n*Refer to the verified source documents below for complete policies and official contact details.*"


class RAGEngine:
    def answer_query(
        self, 
        query: str, 
        top_k: Optional[int] = None,
        department_filter: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Execute enhanced hybrid RAG pipeline with department filtering, re-ranking, and multilingual capabilities.
        """
        k = top_k or settings.TOP_K_CHUNKS
        retrieved_chunks = vector_store_service.query_similar_chunks(
            query_text=query, 
            top_k=k, 
            department_filter=department_filter
        )

        valid_chunks = [
            c for c in retrieved_chunks 
            if c.get("score", 0.0) >= settings.SIMILARITY_THRESHOLD
        ]

        if not valid_chunks:
            return {
                "answer": UNKNOWN_RESPONSE,
                "sources": [],
                "has_sources": False,
                "confidence": "Low",
                "suggested_followups": [
                    "What documents are required for admission?",
                    "What is the fee structure for CSE?",
                    "When are the semester examinations?"
                ]
            }

        # Calculate overall confidence
        avg_score = sum(c.get("score", 0.0) for c in valid_chunks) / len(valid_chunks)
        overall_confidence = "High" if avg_score >= 0.70 else ("Medium" if avg_score >= 0.45 else "Low")

        # Build SourceItem list
        source_items = [
            SourceItem(
                document_id=c["document_id"],
                document_title=c["document_title"],
                page_number=c.get("page_number", 1),
                chunk_index=c.get("chunk_index", 0),
                excerpt=c["content"][:320] + ("..." if len(c["content"]) > 320 else ""),
                score=c.get("score", 0.0),
                confidence_level=c.get("confidence_level", "High"),
                department=c.get("department", "General")
            )
            for c in valid_chunks
        ]

        # Generate response using configured LLM API with graceful fallback
        answer = ""
        used_api = False
        
        # 1. Try Gemini
        if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 15 and not settings.GEMINI_API_KEY.startswith("AQ."):
            try:
                answer = generate_rag_response_with_gemini(query, valid_chunks, language=language)
                used_api = True
                logger.info("Generated answer via Google Gemini API.")
            except Exception as e:
                logger.warning(f"Gemini API error: {e}. Trying fallback.")

        # 2. Try OpenAI
        if not used_api and settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 15:
            try:
                answer = generate_rag_response_with_openai(query, valid_chunks, language=language)
                used_api = True
                logger.info("Generated answer via OpenAI API.")
            except Exception as e:
                logger.warning(f"OpenAI API error: {e}. Trying local synthesizer.")

        # 3. Grounded local synthesizer
        if not answer:
            answer = generate_local_grounded_response(query, valid_chunks, language=language)

        has_sources = True
        if "couldn't find reliable information" in answer.lower():
            has_sources = False
            source_items = []
            overall_confidence = "Low"

        followups = generate_followup_suggestions(query, valid_chunks) if has_sources else [
            "What documents are required for admission?",
            "What is the fee structure for CSE?",
            "When are the semester examinations?"
        ]

        return {
            "answer": answer,
            "sources": source_items,
            "has_sources": has_sources,
            "confidence": overall_confidence,
            "suggested_followups": followups
        }

rag_engine = RAGEngine()
