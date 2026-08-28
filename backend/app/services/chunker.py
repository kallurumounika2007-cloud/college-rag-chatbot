import re
from typing import List, Dict, Any

def recursive_split_text(text: str, chunk_size: int = 650, chunk_overlap: int = 100) -> List[str]:
    """
    Recursively split text trying natural boundaries in order:
    1. Double newlines (paragraphs)
    2. Single newlines
    3. Sentence terminators (. ! ?)
    4. Spaces
    5. Fallback character slice
    """
    if len(text) <= chunk_size:
        return [text.strip()] if text.strip() else []

    separators = ["\n\n", "\n", ". ", "? ", "! ", "; ", " ", ""]
    
    def _split_with_separators(current_text: str, seps: list[str]) -> list[str]:
        if len(current_text) <= chunk_size:
            return [current_text.strip()] if current_text.strip() else []
            
        if not seps:
            # Hard character cut
            res = []
            start = 0
            while start < len(current_text):
                end = min(start + chunk_size, len(current_text))
                chunk = current_text[start:end].strip()
                if chunk:
                    res.append(chunk)
                start += chunk_size - chunk_overlap
            return res

        sep = seps[0]
        parts = current_text.split(sep) if sep else list(current_text)
        
        chunks = []
        current_chunk_parts = []
        current_length = 0
        
        for part in parts:
            part_len = len(part) + (len(sep) if current_chunk_parts else 0)
            if current_length + part_len <= chunk_size:
                current_chunk_parts.append(part)
                current_length += part_len
            else:
                if current_chunk_parts:
                    joined = sep.join(current_chunk_parts).strip()
                    if joined:
                        chunks.append(joined)
                    
                    # Compute overlap from end
                    overlap_parts = []
                    overlap_len = 0
                    for rev_part in reversed(current_chunk_parts):
                        if overlap_len + len(rev_part) + len(sep) <= chunk_overlap:
                            overlap_parts.insert(0, rev_part)
                            overlap_len += len(rev_part) + len(sep)
                        else:
                            break
                    current_chunk_parts = overlap_parts
                    current_length = overlap_len

                # If single part itself exceeds chunk_size, recurse with finer separators
                if len(part) > chunk_size:
                    sub_chunks = _split_with_separators(part, seps[1:])
                    chunks.extend(sub_chunks)
                    current_chunk_parts = []
                    current_length = 0
                else:
                    current_chunk_parts.append(part)
                    current_length += len(part) + (len(sep) if len(current_chunk_parts) > 1 else 0)

        if current_chunk_parts:
            joined = sep.join(current_chunk_parts).strip()
            if joined:
                chunks.append(joined)

        return chunks

    return _split_with_separators(text, separators)


def chunk_document_pages(
    document_id: str,
    document_title: str,
    pages_data: List[Dict[str, Any]],
    chunk_size: int = 650,
    chunk_overlap: int = 100
) -> List[Dict[str, Any]]:
    """
    Process extracted pages from a document and generate structured chunks with full metadata.
    """
    all_chunks = []
    global_chunk_idx = 0

    for page in pages_data:
        page_num = page.get("page_number", 1)
        raw_text = page.get("text", "")
        
        if not raw_text.strip():
            continue

        page_chunks = recursive_split_text(raw_text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        
        for p_chunk in page_chunks:
            if len(p_chunk.strip()) < 15:  # Skip tiny noise
                continue
                
            chunk_obj = {
                "chunk_id": f"{document_id}_p{page_num}_c{global_chunk_idx}",
                "document_id": document_id,
                "document_title": document_title,
                "page_number": page_num,
                "chunk_index": global_chunk_idx,
                "content": p_chunk.strip()
            }
            all_chunks.append(chunk_obj)
            global_chunk_idx += 1

    return all_chunks
