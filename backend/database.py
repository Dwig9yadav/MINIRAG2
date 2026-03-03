"""
Database Configuration - SQLite (local) + Supabase (cloud)
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager

load_dotenv()

# SQLite Configuration
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "edurag.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Create SQLite engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_session():
    """Context manager for database session"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# Supabase Configuration (optional cloud backup)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = None
supabase_admin = None

def init_supabase():
    """Initialize Supabase clients (optional)"""
    global supabase, supabase_admin
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            from supabase import create_client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            if SUPABASE_SERVICE_KEY:
                supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            print("✅ Supabase clients initialized")
        except Exception as e:
            print(f"⚠️ Supabase error: {e}")

def init_database():
    """Initialize SQLite database with tables"""
    from sqlite_models import Base, User
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print(f"✅ SQLite database created at: {DATABASE_PATH}")
    
    # Check if ANY users exist - if so, skip adding demo data
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count > 0:
            print(f"✅ Database has {user_count} users")
        else:
            print("ℹ️ Database is empty. Add users via the register endpoint.")
    finally:
        db.close()

# Initialize on import
init_supabase()
init_database()

