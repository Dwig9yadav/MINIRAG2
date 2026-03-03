<div align="center">

# 🎓 EduRag - AI-Powered Educational Platform

<p align="center">
  <strong>Advanced Retrieval Augmented Generation (RAG) platform for modern education</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.109.0-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**EduRag** is an intelligent educational platform that leverages **Retrieval Augmented Generation (RAG)** technology powered by **Google Gemini AI** to revolutionize how students and teachers interact with educational content. The platform enables semantic search across documents, multilingual support (English, Hindi, and Hinglish), and comprehensive analytics to track learning progress.

### 🎯 Key Highlights

- 🤖 **AI-Powered Search**: Semantic document search using Gemini embeddings
- 📚 **Document Management**: Upload, manage, and search through PDFs and images
- 🌐 **Multilingual**: Support for English, Hindi, and Hinglish
- 👥 **Role-Based Access**: Separate dashboards for Students, Teachers, and Admins
- 📊 **Analytics**: Track learning metrics and engagement
- 💬 **Feedback System**: Anonymous feedback mechanism for students
- 🔒 **Secure Authentication**: JWT-based authentication with role management

---

## ✨ Features

### 🎓 For Students
- **RAG Search Engine**: Query educational documents using natural language
- **PDF Management**: Upload and organize study materials
- **Peer Discovery**: View and connect with classmates
- **Anonymous Feedback**: Share thoughts with teachers anonymously
- **Learning Analytics**: Track your progress and engagement metrics
- **Profile Management**: Customize name and avatar

### 👨‍🏫 For Teachers
- **Content Upload**: Share study materials with students
- **Student Management**: View and manage enrolled students
- **Feedback Dashboard**: Receive and respond to student feedback
- **Analytics Overview**: Monitor class engagement and performance
- **Document Organization**: Categorize and tag educational resources

### 🔧 For Admins
- **User Management**: Manage students, teachers, and administrators
- **System Analytics**: Platform-wide usage statistics
- **Content Moderation**: Review and manage uploaded content
- **Role Assignment**: Set and update user roles

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - Modern UI framework
- **React Router** v6 - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with animations and gradients

### Backend
- **FastAPI** - High-performance Python API framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation
- **Python-JOSE** - JWT token handling
- **Passlib** - Password hashing

### Database & Storage
- **Supabase** - PostgreSQL database and file storage
- **SQLite** - Local development database

### AI & ML
- **Google Gemini AI** - Text embeddings and generation
- **Vector Embeddings** - Semantic search capabilities
- **Multimodal Support** - Text and image processing

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React SPA     │ ◄─────► │   FastAPI API    │ ◄─────► │   Supabase DB   │
│   (Frontend)    │  HTTPS  │   (Backend)      │  SQL    │   (PostgreSQL)  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │   Gemini AI API  │
                            │   (Embeddings)   │
                            └──────────────────┘
```

### Data Flow
1. **User Authentication** → JWT token generation → Role-based access
2. **Document Upload** → Supabase Storage → Vector embedding generation
3. **RAG Query** → Gemini embeddings → Similarity search → Contextual response
4. **Analytics** → Event tracking → Data aggregation → Dashboard visualization

---

## 🚀 Installation

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.11+
- **Git**
- **Supabase Account** (optional, uses SQLite by default)

### Clone Repository
```bash
git clone https://github.com/KAVYA-29-ai/MINIRAG2.git
cd MINIRAG2
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The frontend will run on **http://localhost:3000**

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will run on **http://localhost:8000**

---

## 💻 Usage

### 1️⃣ Register as a Student
- Navigate to `/auth`
- Enter your Institute ID (format: `241550XXXX`)
- Choose a password and avatar
- Click **Register**

### 2️⃣ Upload Documents
- Go to **Student Dashboard**
- Navigate to **Upload** section
- Select PDF files to upload
- Add tags and descriptions

### 3️⃣ Perform RAG Search
- Open **RAG Search** tab
- Select language preference (English/Hindi/Hinglish)
- Enter your question
- Get AI-powered answers with citations

### 4️⃣ View Analytics
- Check **Analytics** tab
- View your learning metrics
- Track document engagement
- Monitor feedback responses

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "institute_id": "2415500001",
  "name": "John Doe",
  "password": "SecurePass123",
  "role": "student",
  "avatar": "M"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "institute_id": "2415500001",
  "password": "SecurePass123"
}
```

### RAG Endpoints

#### Search Documents
```http
POST /api/rag/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "Explain quantum mechanics",
  "language": "english",
  "top_k": 5
}
```

### User Management

#### Get User Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "avatar": "F"
}
```

### Feedback Endpoints

#### Submit Feedback
```http
POST /api/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Great learning experience!",
  "is_anonymous": false,
  "rating": 5
}
```

### Analytics Endpoints

#### Get User Analytics
```http
GET /api/analytics/user
Authorization: Bearer <token>
```

**Full API Documentation**: Visit `http://localhost:8000/docs` when server is running

---

## 📁 Project Structure

```
MINIRAG2/
├── backend/
│   ├── main.py                 # FastAPI application entry
│   ├── database.py             # Database configuration
│   ├── models.py               # Pydantic models
│   ├── sqlite_models.py        # SQLAlchemy models
│   ├── requirements.txt        # Python dependencies
│   ├── routers/
│   │   ├── auth.py            # Authentication routes
│   │   ├── users.py           # User management routes
│   │   ├── rag.py             # RAG search routes
│   │   ├── feedback.py        # Feedback routes
│   │   └── analytics.py       # Analytics routes
│   └── uploads/               # Uploaded files storage
├── src/
│   ├── pages/
│   │   ├── HomePage.js        # Landing page
│   │   ├── LoginRegister.js   # Auth page
│   │   ├── StudentDashboard.js # Student interface
│   │   ├── TeacherDashboard.js # Teacher interface
│   │   └── AdminDashboard.js   # Admin interface
│   ├── components/
│   │   └── AnimatedBackground.js # UI component
│   ├── services/
│   │   └── api.js             # API service layer
│   ├── App.js                 # Main React component
│   └── index.js               # React entry point
├── public/
│   ├── index.html             # HTML template
│   └── images/                # Static images
├── package.json               # Node dependencies
├── README.md                  # This file
└── .gitignore                 # Git ignore rules
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# JWT Secret
SECRET_KEY=your_secret_key_here

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# Database
DATABASE_URL=sqlite:///./edurag.db

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

For frontend, create `.env` in the root directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api
```

⚠️ **Never commit `.env` files to version control**

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 🐛 Known Issues

- Port forwarding configuration needed for GitHub Codespaces deployment
- File upload size limited to 10MB
- Hindi language support in beta

---

## 🗺️ Roadmap

- [ ] Google OAuth integration
- [ ] Real-time collaboration features
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Video content support
- [ ] Batch document processing
- [ ] Export analytics reports

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**KAVYA-29-ai**
- GitHub: [@KAVYA-29-ai](https://github.com/KAVYA-29-ai)
- Repository: [MINIRAG2](https://github.com/KAVYA-29-ai/MINIRAG2)

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful embedding models
- **Supabase** for database and storage infrastructure
- **FastAPI** community for excellent documentation
- **React** team for the amazing framework

---

<div align="center">

### ⭐ Star this repository if you find it useful!

**Made with ❤️ for education**

[Report Bug](https://github.com/KAVYA-29-ai/MINIRAG2/issues) · [Request Feature](https://github.com/KAVYA-29-ai/MINIRAG2/issues)

</div>
