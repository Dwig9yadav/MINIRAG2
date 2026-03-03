"""
SQLAlchemy Models for EduRag SQLite Database
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class FeedbackCategory(str, enum.Enum):
    system = "system"
    feature = "feature"
    content = "content"
    rag = "rag"
    student = "student"
    other = "other"

class FeedbackStatus(str, enum.Enum):
    pending = "pending"
    responded = "responded"
    archived = "archived"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    institution_id = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student")
    avatar = Column(String(20), default="male")
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    feedbacks_sent = relationship("Feedback", back_populates="sender", foreign_keys="Feedback.sender_id")
    search_history = relationship("SearchHistory", back_populates="user")
    pdfs_uploaded = relationship("PDF", back_populates="uploaded_by_user")

class PDF(Base):
    __tablename__ = "pdfs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    status = Column(String(30), default="pending_indexing")
    total_pages = Column(Integer)
    total_chunks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    uploaded_by_user = relationship("User", back_populates="pdfs_uploaded")
    chunks = relationship("PDFChunk", back_populates="pdf", cascade="all, delete-orphan")

class PDFChunk(Base):
    __tablename__ = "pdf_chunks"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    pdf_id = Column(Integer, ForeignKey("pdfs.id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)
    source_file = Column(String(255), nullable=False)
    page_number = Column(Integer)
    chunk_index = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    pdf = relationship("PDF", back_populates="chunks")

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    query = Column(Text, nullable=False)
    language = Column(String(20), default="english")
    results_count = Column(Integer, default=0)
    response_time_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="search_history")

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    category = Column(String(30))
    message = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    admin_response = Column(Text)
    responded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime)
    
    # Relationships
    sender = relationship("User", back_populates="feedbacks_sent", foreign_keys=[sender_id])
    responder = relationship("User", foreign_keys=[responded_by])

class StudentFeedback(Base):
    __tablename__ = "student_feedback"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    is_anonymous = Column(Boolean, default=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    event_type = Column(String(50), nullable=False)
    event_data = Column(Text)  # JSON stored as text
    created_at = Column(DateTime, default=datetime.utcnow)
