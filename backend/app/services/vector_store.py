import logging
import re
import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self):
        self.persist_directory = settings.CHROMA_PERSIST_DIRECTORY
        self.collection_name = settings.COLLECTION_NAME
        self.client = None
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            self.client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True)
            )

            # Check if OpenAI key is configured
            if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 10:
                try:
                    from chromadb.utils import embedding_functions
                    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
                        api_key=settings.OPENAI_API_KEY,
                        model_name=settings.OPENAI_EMBEDDING_MODEL
                    )
                    self.collection = self.client.get_or_create_collection(
                        name=self.collection_name,
                        embedding_function=openai_ef,
                        metadata={"hnsw:space": "cosine"}
                    )
                    logger.info("ChromaDB initialized with OpenAI embedding function.")
                    return
                except Exception as e:
                    logger.warning(f"Failed to initialize OpenAI embedding function: {e}. Falling back to default.")

            # Default embedding function (Chroma built-in ONNX / MiniLM)
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info("ChromaDB initialized with default embedding function.")
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {e}")
            raise

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Add a list of structured chunk dicts to ChromaDB with department metadata."""
        if not chunks:
            return 0

        ids = [c["chunk_id"] for c in chunks]
        documents = [c["content"] for c in chunks]
        metadatas = [
            {
                "document_id": str(c["document_id"]),
                "document_title": str(c["document_title"]),
                "page_number": int(c.get("page_number", 1)),
                "chunk_index": int(c.get("chunk_index", 0)),
                "department": str(c.get("department", "General"))
            }
            for c in chunks
        ]

        self.collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        return len(chunks)

    def delete_document_chunks(self, document_id: str) -> int:
        """Delete all chunks belonging to a specific document."""
        try:
            results = self.collection.get(where={"document_id": document_id})
            ids_to_delete = results.get("ids", [])
            if ids_to_delete:
                self.collection.delete(ids=ids_to_delete)
            return len(ids_to_delete)
        except Exception as e:
            logger.error(f"Error deleting chunks for document {document_id}: {e}")
            return 0

    def query_similar_chunks(
        self, 
        query_text: str, 
        top_k: int = 4, 
        department_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Hybrid semantic & keyword search with re-ranking and department filtering.
        Falls back to unfiltered search if department filter yields 0 results.
        """
        if not query_text.strip() or self.collection.count() == 0:
            return []

        try:
            use_dept_filter = (
                department_filter 
                and department_filter.lower() not in ["all", "none", ""]
            )

            # Retrieve candidate pool for re-ranking (2x top_k)
            candidate_k = min(max(top_k * 2, 6), self.collection.count())
            
            base_kwargs = {
                "query_texts": [query_text],
                "n_results": candidate_k,
                "include": ["documents", "metadatas", "distances"]
            }

            results = None

            # 1. Try filtered query first
            if use_dept_filter:
                try:
                    filtered_kwargs = dict(base_kwargs)
                    filtered_kwargs["where"] = {"department": department_filter}
                    results = self.collection.query(**filtered_kwargs)
                    # If empty results, fall through to unfiltered
                    if not results or not results.get("ids") or len(results["ids"][0]) == 0:
                        logger.info(f"Department filter '{department_filter}' returned 0 results — falling back to unfiltered search.")
                        results = None
                except Exception as filter_err:
                    logger.warning(f"Department filter failed: {filter_err}. Retrying without filter.")
                    results = None

            # 2. Unfiltered fallback
            if results is None:
                results = self.collection.query(**base_kwargs)

            retrieved = []
            if results and results.get("ids") and len(results["ids"]) > 0:
                ids = results["ids"][0]
                docs = results["documents"][0]
                metas = results["metadatas"][0]
                distances = results["distances"][0] if "distances" in results else [0.5] * len(ids)

                # Extract query terms for keyword density scoring
                stop_words = {"what", "is", "the", "for", "are", "when", "how", "to", "in", "and", 
                              "a", "an", "of", "on", "can", "i", "do", "does", "where", "which"}
                query_tokens = [
                    w.lower() for w in re.findall(r'\b\w+\b', query_text) 
                    if w.lower() not in stop_words and len(w) > 2
                ]

                for i in range(len(ids)):
                    dist = distances[i] if i < len(distances) else 0.5
                    semantic_score = max(0.0, min(1.0, 1.0 - (dist / 2.0)))

                    # Keyword overlap score
                    doc_content_lower = docs[i].lower()
                    kw_matches = sum(1 for token in query_tokens if token in doc_content_lower)
                    keyword_score = min(1.0, kw_matches / max(len(query_tokens), 1))

                    # Hybrid weighted score: 70% semantic + 30% lexical keyword
                    hybrid_score = round((0.7 * semantic_score) + (0.3 * keyword_score), 3)

                    # Confidence label
                    if hybrid_score >= 0.75:
                        conf_level = "High"
                    elif hybrid_score >= 0.50:
                        conf_level = "Medium"
                    else:
                        conf_level = "Low"

                    retrieved.append({
                        "chunk_id": ids[i],
                        "content": docs[i],
                        "document_id": metas[i].get("document_id", ""),
                        "document_title": metas[i].get("document_title", "Unknown"),
                        "page_number": metas[i].get("page_number", 1),
                        "chunk_index": metas[i].get("chunk_index", 0),
                        "department": metas[i].get("department", "General"),
                        "distance": dist,
                        "score": hybrid_score,
                        "confidence_level": conf_level
                    })

                # Re-rank candidates by hybrid score
                retrieved.sort(key=lambda x: x["score"], reverse=True)

            return retrieved[:top_k]
        except Exception as e:
            logger.error(f"Error querying ChromaDB: {e}")
            return []

    def get_total_chunks(self) -> int:
        try:
            return self.collection.count()
        except Exception:
            return 0

    def get_chunks_for_document(self, document_id: str) -> List[Dict[str, Any]]:
        try:
            res = self.collection.get(where={"document_id": document_id}, include=["documents", "metadatas"])
            chunks = []
            ids = res.get("ids", [])
            docs = res.get("documents", [])
            metas = res.get("metadatas", [])
            for i in range(len(ids)):
                chunks.append({
                    "chunk_id": ids[i],
                    "content": docs[i],
                    "document_id": metas[i].get("document_id", ""),
                    "document_title": metas[i].get("document_title", ""),
                    "page_number": metas[i].get("page_number", 1),
                    "chunk_index": metas[i].get("chunk_index", 0),
                    "department": metas[i].get("department", "General")
                })
            chunks.sort(key=lambda x: (x["page_number"], x["chunk_index"]))
            return chunks
        except Exception as e:
            logger.error(f"Error getting chunks for document {document_id}: {e}")
            return []

vector_store_service = VectorStoreService()
