"""
RAG Router - Document Search and PDF Management
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import os
import time

from models import RAGQuery
from database import get_db
from sqlite_models import PDF, PDFChunk, SearchHistory, User
from routers.auth import get_current_user

router = APIRouter()

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/search")
async def search_documents(
    query: RAGQuery,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search documents using RAG"""
    start_time = time.time()
    
    try:
        # Search PDF chunks
        chunks = db.query(PDFChunk).filter(
            PDFChunk.content.ilike(f"%{query.query}%")
        ).limit(5).all()
        
        results = []
        if chunks:
            for i, chunk in enumerate(chunks):
                results.append({
                    "id": chunk.id,
                    "content": chunk.content[:500],
                    "source": chunk.source_file,
                    "relevance_score": 0.95 - (i * 0.05),
                    "page_number": chunk.page_number or 1
                })
        else:
            # Return helpful message when no PDFs are indexed
            results = [
                {
                    "id": 0,
                    "content": f"No indexed PDFs found. Ask your teacher to upload course materials to enable RAG search.",
                    "source": "System",
                    "relevance_score": 1.0,
                    "page_number": 0
                }
            ]
        
        response_time = int((time.time() - start_time) * 1000)
        
        # Log search history
        search_entry = SearchHistory(
            user_id=current_user.get("id"),
            query=query.query,
            language=query.language,
            results_count=len(results),
            response_time_ms=response_time
        )
        db.add(search_entry)
        db.commit()
        
        return {
            "query": query.query,
            "results": results,
            "total_results": len(results),
            "response_time_ms": response_time
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a PDF for indexing (Teacher/Admin only)"""
    if current_user.get("role") not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers and admins can upload PDFs")
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Create PDF record
        new_pdf = PDF(
            filename=file.filename,
            storage_path=file_path,
            uploaded_by=current_user.get("id"),
            status="pending_indexing"
        )
        
        db.add(new_pdf)
        db.commit()
        db.refresh(new_pdf)
        
        return {
            "message": "PDF uploaded successfully",
            "pdf": {
                "id": new_pdf.id,
                "filename": new_pdf.filename,
                "status": new_pdf.status
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pdfs")
async def list_pdfs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all uploaded PDFs"""
    pdfs = db.query(PDF).order_by(PDF.created_at.desc()).all()
    
    return [
        {
            "id": p.id,
            "filename": p.filename,
            "status": p.status,
            "total_pages": p.total_pages,
            "total_chunks": p.total_chunks,
            "uploaded_by": p.uploaded_by,
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in pdfs
    ]

@router.get("/search-history")
async def get_search_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's search history"""
    history = db.query(SearchHistory).filter(
        SearchHistory.user_id == current_user.get("id")
    ).order_by(SearchHistory.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": h.id,
            "query": h.query,
            "language": h.language,
            "results_count": h.results_count,
            "created_at": h.created_at.isoformat() if h.created_at else None
        }
        for h in history
    ]

@router.get("/trending")
async def get_trending_topics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get trending search topics"""
    # Get most common queries
    trending = db.query(
        SearchHistory.query,
        func.count(SearchHistory.id).label('count')
    ).group_by(SearchHistory.query).order_by(func.count(SearchHistory.id).desc()).limit(10).all()
    
    if trending:
        return [
            {
                "topic": t.query,
                "count": t.count,
                "difficulty": "High" if t.count > 40 else "Medium" if t.count > 20 else "Low"
            }
            for t in trending
        ]
    
    return []


@router.delete("/pdfs/{pdf_id}")
async def delete_pdf(
    pdf_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a PDF and its chunks (Teacher/Admin only)"""
    if current_user.get("role") not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers and admins can delete PDFs")
    
    pdf = db.query(PDF).filter(PDF.id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    # Delete file from disk
    if os.path.exists(pdf.storage_path):
        os.remove(pdf.storage_path)
    
    db.delete(pdf)
    db.commit()
    
    return {"message": "PDF deleted successfully"}


@router.post("/pdfs/{pdf_id}/index")
async def index_pdf(
    pdf_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Index a PDF - extract text and create searchable chunks (Teacher/Admin only)"""
    if current_user.get("role") not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers and admins can index PDFs")
    
    pdf = db.query(PDF).filter(PDF.id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    try:
        # Try to extract text using PyPDF2 or pdfplumber
        text_content = ""
        total_pages = 0
        
        try:
            import PyPDF2
            with open(pdf.storage_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                total_pages = len(reader.pages)
                for page_num, page in enumerate(reader.pages):
                    page_text = page.extract_text() or ""
                    if page_text.strip():
                        text_content += f"\n--- Page {page_num + 1} ---\n{page_text}"
        except ImportError:
            # Fallback: create a single chunk with filename info
            text_content = f"PDF uploaded: {pdf.filename}. Content extraction requires PyPDF2 (pip install PyPDF2)."
            total_pages = 1
        except Exception as e:
            text_content = f"PDF uploaded: {pdf.filename}. Text extraction failed: {str(e)}"
            total_pages = 1
        
        # Delete existing chunks for this PDF
        db.query(PDFChunk).filter(PDFChunk.pdf_id == pdf_id).delete()
        
        # Split text into chunks of ~500 chars
        chunk_size = 500
        chunks_created = 0
        
        if text_content.strip():
            words = text_content.split()
            current_chunk = ""
            current_page = 1
            
            for word in words:
                if word.startswith("--- Page") and word.endswith("---"):
                    continue
                if word == "---":
                    continue
                if word == "Page":
                    continue
                    
                # Track page numbers
                if "--- Page" in current_chunk:
                    try:
                        page_marker = current_chunk.split("--- Page")[-1].split("---")[0].strip()
                        current_page = int(page_marker) if page_marker.isdigit() else current_page
                    except:
                        pass
                
                current_chunk += " " + word
                
                if len(current_chunk) >= chunk_size:
                    new_chunk = PDFChunk(
                        pdf_id=pdf_id,
                        content=current_chunk.strip(),
                        source_file=pdf.filename,
                        page_number=current_page,
                        chunk_index=chunks_created
                    )
                    db.add(new_chunk)
                    chunks_created += 1
                    current_chunk = ""
            
            # Add remaining text as final chunk
            if current_chunk.strip():
                new_chunk = PDFChunk(
                    pdf_id=pdf_id,
                    content=current_chunk.strip(),
                    source_file=pdf.filename,
                    page_number=current_page,
                    chunk_index=chunks_created
                )
                db.add(new_chunk)
                chunks_created += 1
        
        # Update PDF record
        pdf.status = "indexed"
        pdf.total_pages = total_pages
        pdf.total_chunks = chunks_created
        db.commit()
        
        return {
            "message": f"PDF indexed successfully: {chunks_created} chunks created from {total_pages} pages",
            "total_pages": total_pages,
            "total_chunks": chunks_created
        }
    
    except Exception as e:
        pdf.status = "index_failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")


@router.get("/pdfs/{pdf_id}")
async def get_pdf_detail(
    pdf_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get PDF details with uploader info"""
    pdf = db.query(PDF).filter(PDF.id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    uploader = db.query(User).filter(User.id == pdf.uploaded_by).first()
    
    return {
        "id": pdf.id,
        "filename": pdf.filename,
        "status": pdf.status,
        "total_pages": pdf.total_pages,
        "total_chunks": pdf.total_chunks,
        "uploaded_by": pdf.uploaded_by,
        "uploader_name": uploader.name if uploader else "Unknown",
        "created_at": pdf.created_at.isoformat() if pdf.created_at else None
    }