import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rag-search');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userName, setUserName] = useState('Dr. Smith');
  const [editName, setEditName] = useState('Dr. Smith');
  const [selectedAvatar, setSelectedAvatar] = useState('male');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleLogout = () => {
    navigate('/');
  };

  // Sample teachers data
  const teachers = [
    { id: 1, name: 'Dr. Rajesh Kumar', subject: 'Mathematics', avatar: 'male', status: 'Online' },
    { id: 2, name: 'Prof. Meera Joshi', subject: 'Physics', avatar: 'female', status: 'Offline' },
    { id: 3, name: 'Dr. Anil Verma', subject: 'Chemistry', avatar: 'male', status: 'Online' },
    { id: 4, name: 'Prof. Sunita Sharma', subject: 'Biology', avatar: 'female', status: 'Online' },
  ];

  // Sample student problems for analysis (from RAG data)
  const studentProblems = [
    { topic: 'Calculus Integration', count: 45, difficulty: 'High' },
    { topic: 'Linear Algebra', count: 32, difficulty: 'Medium' },
    { topic: 'Probability Theory', count: 28, difficulty: 'High' },
    { topic: 'Differential Equations', count: 24, difficulty: 'Medium' },
    { topic: 'Statistics Basics', count: 18, difficulty: 'Low' },
  ];

  const handleSendFeedback = () => {
    if (feedbackMessage.trim()) {
      alert('Feedback sent to Admin successfully!');
      setFeedbackMessage('');
    }
  };

  return (
    <div className="teacher-dashboard">
      <AnimatedBackground />
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/images/logo.png" alt="EduRag Logo" className="sidebar-logo" />
          <h2>EduRag</h2>
        </div>

        <div className="role-badge">
          <span>👨‍🏫</span> Teacher Portal
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'rag-search' ? 'active' : ''}`}
            onClick={() => setActiveTab('rag-search')}
          >
            <span className="nav-icon">🔍</span>
            <span>RAG Search</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            <span className="nav-icon">👥</span>
            <span>Other Teachers</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <span className="nav-icon">📊</span>
            <span>Student Analysis</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <span className="nav-icon">💬</span>
            <span>Admin Feedback</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <img 
              src={selectedAvatar === 'male' ? '/images/male.png' : '/images/female.png'}
              alt={selectedAvatar}
              className="avatar-image"
            />
            <div className="user-info">
              <p className="user-name">{userName}</p>
              <p className="user-id">Teacher ID: TCH001</p>
            </div>
          </div>
          <button 
            className="edit-profile-btn"
            onClick={() => setShowProfileModal(true)}
          >
            Edit Profile
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Your Profile</h3>
            
            <div className="profile-form">
              <div className="form-group-modal">
                <label>Your Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  className="profile-input"
                />
              </div>

              <div className="form-group-modal">
                <label>Choose Avatar</label>
                <div className="avatar-options-modal">
                  <button 
                    className={`avatar-option ${selectedAvatar === 'male' ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar('male')}
                  >
                    <img src="/images/male.png" alt="Male" className="modal-avatar-img" />
                    <p>Male</p>
                  </button>
                  <button 
                    className={`avatar-option ${selectedAvatar === 'female' ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar('female')}
                  >
                    <img src="/images/female.png" alt="Female" className="modal-avatar-img" />
                    <p>Female</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-modal-buttons">
              <button 
                className="save-profile-btn"
                onClick={() => {
                  setUserName(editName);
                  setShowProfileModal(false);
                }}
              >
                Save Changes
              </button>
              <button 
                className="cancel-profile-btn"
                onClick={() => {
                  setEditName(userName);
                  setShowProfileModal(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h1>Teacher Dashboard</h1>
          <div className="top-bar-actions">
            <input
              type="text"
              placeholder="Quick search..."
              className="search-input"
            />
            <button className="help-btn" title="Help">?</button>
          </div>
        </header>

        <div className="content-area">
          {/* RAG Search Tab - Search Student PDFs */}
          {activeTab === 'rag-search' && (
            <section className="tab-content">
              <h2>🔍 RAG Search - Student PDFs & Materials</h2>
              <p className="section-desc">Search across all student-uploaded PDFs and course materials using RAG</p>
              
              <div className="search-container">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search student PDFs, assignments, notes, or any uploaded content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="large-search-input"
                  />
                  <button className="search-btn">
                    <span>🔍</span> Search with RAG
                  </button>
                </div>

                <div className="language-selector">
                  <label>Language Preference:</label>
                  <select defaultValue="english">
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>

                <h3>📂 Search Categories</h3>
                <div className="tips-grid">
                  <div className="tip-card">
                    <span className="tip-icon">📄</span>
                    <p>Student Uploaded PDFs</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">📝</span>
                    <p>Assignment Submissions</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">📚</span>
                    <p>Course Materials</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">📋</span>
                    <p>Question Papers</p>
                  </div>
                </div>

                <h3>🕐 Recent Searches</h3>
                <div className="recent-searches">
                  <div className="recent-search-item">
                    <span>🔍</span>
                    <p>"calculus integration methods"</p>
                    <span className="search-time">2 hours ago</span>
                  </div>
                  <div className="recent-search-item">
                    <span>🔍</span>
                    <p>"probability theory examples"</p>
                    <span className="search-time">Yesterday</span>
                  </div>
                  <div className="recent-search-item">
                    <span>🔍</span>
                    <p>"student notes linear algebra"</p>
                    <span className="search-time">2 days ago</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Other Teachers Tab */}
          {activeTab === 'teachers' && (
            <section className="tab-content">
              <h2>👥 Faculty Members</h2>
              <p className="section-desc">View other teachers in your institution</p>
              
              <div className="teachers-grid">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="teacher-card">
                    <img 
                      src={teacher.avatar === 'male' ? '/images/male.png' : '/images/female.png'}
                      alt={teacher.name}
                      className="teacher-avatar-img"
                    />
                    <h3>{teacher.name}</h3>
                    <p className="teacher-subject">{teacher.subject}</p>
                    <span className={`teacher-status ${teacher.status.toLowerCase()}`}>
                      {teacher.status === 'Online' ? '🟢' : '⚫'} {teacher.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Student Analysis Tab - RAG Insights */}
          {activeTab === 'analysis' && (
            <section className="tab-content">
              <h2>📊 Student Problem Analysis (RAG Insights)</h2>
              <p className="section-desc">Analyze student learning patterns based on RAG search data</p>
              
              <div className="analysis-stats">
                <div className="stat-card">
                  <span className="stat-icon">📈</span>
                  <div className="stat-info">
                    <p className="stat-number">147</p>
                    <p className="stat-label">Total Queries Today</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🎯</span>
                  <div className="stat-info">
                    <p className="stat-number">89%</p>
                    <p className="stat-label">RAG Accuracy</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">👥</span>
                  <div className="stat-info">
                    <p className="stat-number">45</p>
                    <p className="stat-label">Active Students</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📚</span>
                  <div className="stat-info">
                    <p className="stat-number">23</p>
                    <p className="stat-label">PDFs Indexed</p>
                  </div>
                </div>
              </div>

              <h3>🔥 Most Searched Topics (RAG Data)</h3>
              <div className="problems-list">
                {studentProblems.map((problem, index) => (
                  <div key={index} className="problem-item">
                    <div className="problem-rank">#{index + 1}</div>
                    <div className="problem-info">
                      <p className="problem-topic">{problem.topic}</p>
                      <p className="problem-searches">{problem.count} RAG searches this week</p>
                    </div>
                    <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                ))}
              </div>

              <h3>💡 RAG Analysis Insights</h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <h4>📌 Focus Area Needed</h4>
                  <p>Students are frequently searching Calculus Integration. Consider adding more PDFs on this topic.</p>
                </div>
                <div className="insight-card">
                  <h4>✅ Well Understood</h4>
                  <p>Statistics Basics has lower search rate, indicating good comprehension from existing materials.</p>
                </div>
                <div className="insight-card">
                  <h4>📈 Trending Topic</h4>
                  <p>Probability Theory searches increased 40% this week. Students preparing for exams?</p>
                </div>
              </div>
            </section>
          )}

          {/* Admin Feedback Tab */}
          {activeTab === 'feedback' && (
            <section className="tab-content">
              <h2>💬 Send Feedback to Admin</h2>
              
              <div className="feedback-notice">
                <span className="notice-icon">ℹ️</span>
                <p>Your feedback will be sent with your identity visible to the admin for proper follow-up.</p>
              </div>

              <div className="feedback-form">
                <div className="sender-info">
                  <img 
                    src={selectedAvatar === 'male' ? '/images/male.png' : '/images/female.png'}
                    alt="Your avatar"
                    className="sender-avatar"
                  />
                  <div>
                    <p className="sender-name">{userName}</p>
                    <p className="sender-id">Teacher ID: TCH001</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Feedback Category</label>
                  <select className="feedback-select">
                    <option value="">Select category...</option>
                    <option value="system">System Issue</option>
                    <option value="feature">Feature Request</option>
                    <option value="content">Content Suggestion</option>
                    <option value="rag">RAG Improvement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Your Feedback</label>
                  <textarea
                    placeholder="Describe your feedback, suggestions, or concerns about the RAG system..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    rows="6"
                  ></textarea>
                </div>

                <button className="send-feedback-btn" onClick={handleSendFeedback}>
                  📤 Send Feedback to Admin
                </button>
              </div>

              <div className="feedback-history">
                <h3>Previous Feedback</h3>
                <div className="feedback-item">
                  <div className="feedback-header">
                    <span className="feedback-category">RAG Improvement</span>
                    <span className="feedback-date">Feb 28, 2026</span>
                  </div>
                  <p>Suggested improving Hindi language support in RAG responses...</p>
                  <span className="feedback-status responded">✓ Responded</span>
                </div>
                <div className="feedback-item">
                  <div className="feedback-header">
                    <span className="feedback-category">Feature Request</span>
                    <span className="feedback-date">Feb 25, 2026</span>
                  </div>
                  <p>Request for bulk PDF upload feature...</p>
                  <span className="feedback-status pending">⏳ Under Review</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
