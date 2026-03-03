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
    """Initialize SQLite database with tables and demo data"""
    from sqlite_models import Base, User
    from passlib.context import CryptContext
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print(f"✅ SQLite database created at: {DATABASE_PATH}")
    
    # Add demo users if not exist
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    with get_db_session() as db:
        # Check if demo users exist
        existing = db.query(User).filter(User.institution_id == "24155012345").first()
        if not existing:
            demo_users = [
                User(
                    name="Demo Student",
                    institution_id="24155012345",
                    password_hash=pwd_context.hash("demo123"),
                    role="student",
                    avatar="male",
                    status="active"
                ),
                User(
                    name="Dr. Smith",
                    institution_id="TCH001",
                    password_hash=pwd_context.hash("teacher123"),
                    role="teacher",
                    avatar="male",
                    status="active"
                ),
                User(
                    name="Admin",
                    institution_id="ADMIN001",
                    password_hash=pwd_context.hash("admin123"),
                    role="admin",
                    avatar="male",
                    status="active"
                ),
                User(
                    name="Rahul Kumar",
                    institution_id="2415501001",
                    password_hash=pwd_context.hash("student123"),
                    role="student",
                    avatar="male",
                    status="active"
                ),
                User(
                    name="Priya Singh",
                    institution_id="2415501002",
                    password_hash=pwd_context.hash("student123"),
                    role="student",
                    avatar="female",
                    status="active"
                ),
                User(
                    name="Dr. Rajesh Kumar",
                    institution_id="TCH002",
                    password_hash=pwd_context.hash("teacher123"),
                    role="teacher",
                    avatar="male",
                    status="active"
                ),
                User(
                    name="Prof. Meera Joshi",
                    institution_id="TCH003",
                    password_hash=pwd_context.hash("teacher123"),
                    role="teacher",
                    avatar="female",
                    status="active"
                ),
            ]
            db.add_all(demo_users)
            print("✅ Demo users added to database")
        else:
            print("✅ Database already has users")

# Initialize on import
init_supabase()
init_database()

