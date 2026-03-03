# EduRag - Advanced RAG Learning Platform

An advanced Retrieval Augmented Generation (RAG) model designed for students, teachers, and administrators. Built with React.js, Gemini AI, and Supabase.

## Features

✨ **AI-Powered Learning** - Powered by Gemini AI for intelligent document analysis
📄 **PDF Management** - Upload and manage study materials securely
🔍 **RAG Search** - Smart search with vector embeddings for text and images
🌍 **Multi-Language Support** - Learn in English, Hindi, and Hinglish
👥 **Student Community** - Connect with peers and share feedback
📊 **Analytics Dashboard** - Track learning progress with detailed insights

## Pages

### 1. **Home Page** (`/`)
- Introduction to EduRag
- Feature showcase
- How it works section
- Quick navigation buttons
- Responsive design with gradient backgrounds

### 2. **Authentication Page** (`/auth`)
- Register/Login toggle
- Form validation
- Avatar selection (Male/Female)
- Role selection (Student/Teacher/Admin)
- Clean, modern authentication UI

### 3. **Student Dashboard** (`/dashboard`)
- **Sidebar Navigation** with quick access to features
- **RAG Search** - AI-powered document search with language preferences
- **Buddies** - View and connect with other students
- **Feedback** - Share feedback with teachers (anonymous option)
- **Analysis** - View learning metrics and insights

## Tech Stack

- **Frontend**: React.js 18
- **Routing**: React Router v6
- **Styling**: CSS3 with modern gradients and animations
- **Future Backend**: Gemini API + Supabase
- **Language**: JavaScript/JSX

## Project Structure

```
MINIRAG2/
├── public/
│   ├── index.html
│   └── images/
├── src/
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── HomePage.css
│   │   ├── LoginRegister.js
│   │   ├── LoginRegister.css
│   │   ├── StudentDashboard.js
│   │   └── StudentDashboard.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── .gitignore
```

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

3. **Build for Production**
   ```bash
   npm run build
   ```

## Features Implemented (UI Only)

✅ Responsive design for mobile, tablet, and desktop
✅ Modern gradient UI inspired by Gemini
✅ Smooth animations and transitions
✅ Avatar selection (Male/Female emojis)
✅ Multi-tab dashboard system
✅ Form inputs (no backend connection yet)
✅ Language preference selector
✅ Analytics cards and metrics display
✅ Feedback form with anonymous toggle
✅ Student buddies grid
✅ Interactive navigation

## Future Additions

🔜 Database integration with Supabase
🔜 Authentication with JWT tokens
🔜 Gemini AI API integration for RAG search
🔜 Vector embeddings for documents
🔜 Real-time notifications
🔜 File upload functionality
🔜 Teacher and Admin dashboards
🔜 PDF viewer component

## Notes

- **No Backend Connected Yet**: All pages are UI only. Database and API connections will be added later.
- **No Authentication Logic**: Login/Register forms don't validate against a database.
- **Placeholder Data**: Dashboard shows sample data for demonstration.

## Styling

All components use modern CSS with:
- Glassmorphism effects (backdrop blur)
- Gradient backgrounds
- Smooth transitions and animations
- Dark mode color scheme
- Mobile-responsive design

## Color Palette

- **Primary Gradient**: #667eea → #764ba2 (Purple)
- **Background**: Dark blue (#1e293b to #0f172a)
- **Text**: Light colors with transparency for hierarchy
- **Accent**: Error red (#ef4444) for logout/danger actions

---

**Created**: 2026 | **Version**: 0.1.0
