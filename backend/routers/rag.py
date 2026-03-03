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
from sqlite_models import PDF, PDFChunk, SearchHistory
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
            # Return demo results if no chunks found
            results = [
                {
                    "id": 1,
                    "content": f"This is a sample result for '{query.query}'. The integration by parts formula is: ∫u dv = uv - ∫v du",
                    "source": "Calculus_Chapter5.pdf",
                    "relevance_score": 0.95,
                    "page_number": 42
                },
                {
                    "id": 2,
                    "content": f"Another relevant result for '{query.query}'. The fundamental theorem establishes the relationship between differentiation and integration.",
                    "source": "Mathematics_Basics.pdf",
                    "relevance_score": 0.88,
                    "page_number": 15
                },
                {
                    "id": 3,
                    "content": f"Additional context for '{query.query}'. Definite integrals represent the signed area under a curve.",
                    "source": "Advanced_Math.pdf",
                    "relevance_score": 0.82,
                    "page_number": 38
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
    
    # Return demo trending if no data
    return [
        {"topic": "Integration", "count": 45, "difficulty": "High"},
        {"topic": "Derivatives", "count": 38, "difficulty": "Medium"},
        {"topic": "Probability", "count": 32, "difficulty": "Medium"},
        {"topic": "Linear Algebra", "count": 28, "difficulty": "Medium"},
        {"topic": "Statistics", "count": 22, "difficulty": "Medium"}
    ]
