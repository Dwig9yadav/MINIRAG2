-- EduRag Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";  -- For RAG embeddings

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    institution_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    avatar VARCHAR(20) DEFAULT 'male' CHECK (avatar IN ('male', 'female')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on institution_id for fast lookups
CREATE INDEX idx_users_institution_id ON users(institution_id);
CREATE INDEX idx_users_role ON users(role);

-- PDFs table (uploaded documents)
CREATE TABLE IF NOT EXISTS pdfs (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'pending_indexing' CHECK (status IN ('pending_indexing', 'indexing', 'indexed', 'failed')),
    total_pages INTEGER,
    total_chunks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pdfs_status ON pdfs(status);
CREATE INDEX idx_pdfs_uploaded_by ON pdfs(uploaded_by);

-- PDF Chunks table (for RAG)
CREATE TABLE IF NOT EXISTS pdf_chunks (
    id SERIAL PRIMARY KEY,
    pdf_id INTEGER REFERENCES pdfs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    source_file VARCHAR(255) NOT NULL,
    page_number INTEGER,
    chunk_index INTEGER,
    embedding vector(1536),  -- For OpenAI embeddings (adjust dimension for other models)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vector index for similarity search
CREATE INDEX idx_pdf_chunks_embedding ON pdf_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_pdf_chunks_content ON pdf_chunks USING gin(to_tsvector('english', content));

-- Search History table
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    language VARCHAR(20) DEFAULT 'english',
    results_count INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_created ON search_history(created_at DESC);

-- Feedback table (Teacher to Admin)
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(30) CHECK (category IN ('system', 'feature', 'content', 'rag', 'student', 'other')),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'archived')),
    admin_response TEXT,
    responded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_feedback_sender ON feedback(sender_id);
CREATE INDEX idx_feedback_status ON feedback(status);

-- Student Feedback (Anonymous option)
CREATE TABLE IF NOT EXISTS student_feedback (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT false,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events table (for tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);

-- ============================================
-- Functions for Analytics
-- ============================================

-- Function to get trending topics
CREATE OR REPLACE FUNCTION get_trending_topics()
RETURNS TABLE(topic TEXT, count BIGINT, difficulty TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query as topic,
        COUNT(*) as count,
        CASE 
            WHEN COUNT(*) > 40 THEN 'High'
            WHEN COUNT(*) > 20 THEN 'Medium'
            ELSE 'Low'
        END as difficulty
    FROM search_history
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY query
    ORDER BY count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to get usage by role
CREATE OR REPLACE FUNCTION get_usage_by_role()
RETURNS TABLE(role TEXT, percentage NUMERIC, count BIGINT) AS $$
DECLARE
    total_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO total_count FROM search_history;
    
    RETURN QUERY
    SELECT 
        u.role::TEXT,
        ROUND((COUNT(*)::NUMERIC / NULLIF(total_count, 0)) * 100, 1) as percentage,
        COUNT(*) as count
    FROM search_history sh
    JOIN users u ON sh.user_id = u.id
    GROUP BY u.role
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily queries
CREATE OR REPLACE FUNCTION get_daily_queries(start_date TIMESTAMP)
RETURNS TABLE(date DATE, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
    FROM search_history
    WHERE created_at >= start_date
    GROUP BY DATE(created_at)
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- Function to get top topics
CREATE OR REPLACE FUNCTION get_top_topics(limit_count INTEGER)
RETURNS TABLE(topic TEXT, count BIGINT, trend TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query as topic,
        COUNT(*) as count,
        'stable'::TEXT as trend
    FROM search_history
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY query
    ORDER BY count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function for vector similarity search (RAG)
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE(
    id INT,
    content TEXT,
    source_file VARCHAR,
    page_number INT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id,
        pc.content,
        pc.source_file,
        pc.page_number,
        1 - (pc.embedding <=> query_embedding) as similarity
    FROM pdf_chunks pc
    WHERE 1 - (pc.embedding <=> query_embedding) > match_threshold
    ORDER BY pc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_feedback ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::TEXT = institution_id OR 
                      EXISTS (SELECT 1 FROM users u WHERE u.institution_id = auth.uid()::TEXT AND u.role IN ('admin', 'teacher')));

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::TEXT = institution_id);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.institution_id = auth.uid()::TEXT AND u.role = 'admin'));

-- Search history policies  
CREATE POLICY "Users can view their own search history" ON search_history
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE institution_id = auth.uid()::TEXT));

CREATE POLICY "Users can create search history" ON search_history
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE institution_id = auth.uid()::TEXT));

-- Feedback policies
CREATE POLICY "Teachers can create feedback" ON feedback
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = sender_id AND u.role = 'teacher'));

CREATE POLICY "Teachers can view own feedback" ON feedback
    FOR SELECT USING (sender_id = (SELECT id FROM users WHERE institution_id = auth.uid()::TEXT) OR
                      EXISTS (SELECT 1 FROM users u WHERE u.institution_id = auth.uid()::TEXT AND u.role = 'admin'));

-- ============================================
-- Insert Demo Data
-- ============================================

-- Insert demo users (passwords are hashed versions of 'demo123', 'teacher123', 'admin123')
INSERT INTO users (name, institution_id, password_hash, role, avatar, status) VALUES
    ('Demo Student', '24155012345', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Xup.3G26', 'student', 'male', 'active'),
    ('Dr. Smith', 'TCH001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Xup.3G26', 'teacher', 'male', 'active'),
    ('Admin', 'ADMIN001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Xup.3G26', 'admin', 'male', 'active'),
    ('Rahul Kumar', '2415501001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Xup.3G26', 'student', 'male', 'active'),
    ('Priya Singh', '2415501002', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Xup.3G26', 'student', 'female', 'active'),
    ('Dr. Rajesh Kumar', 'TCH002', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Xup.3G26', 'teacher', 'male', 'active'),
    ('Prof. Meera Joshi', 'TCH003', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Xup.3G26', 'teacher', 'female', 'active')
ON CONFLICT (institution_id) DO NOTHING;

-- Insert sample PDFs
INSERT INTO pdfs (filename, storage_path, uploaded_by, status, total_pages, total_chunks) VALUES
    ('Calculus_Chapter5.pdf', 'pdfs/system/Calculus_Chapter5.pdf', 2, 'indexed', 50, 45),
    ('Probability_Theory.pdf', 'pdfs/system/Probability_Theory.pdf', 2, 'indexed', 35, 32),
    ('Linear_Algebra.pdf', 'pdfs/system/Linear_Algebra.pdf', 2, 'indexed', 60, 58),
    ('Statistics_Fundamentals.pdf', 'pdfs/system/Statistics_Fundamentals.pdf', 2, 'pending_indexing', 40, 0);

-- Insert sample search history
INSERT INTO search_history (user_id, query, language, results_count) VALUES
    (1, 'calculus integration methods', 'english', 5),
    (1, 'probability theory examples', 'english', 3),
    (4, 'linear algebra basics', 'hinglish', 4),
    (5, 'statistics formulas', 'hindi', 2);

-- Insert sample feedback
INSERT INTO feedback (sender_id, category, message, status) VALUES
    (2, 'rag', 'The RAG system needs better Hindi language support.', 'pending'),
    (6, 'feature', 'Request for bulk PDF upload feature.', 'responded'),
    (7, 'system', 'RAG search is slow during peak hours.', 'pending');

COMMIT;
