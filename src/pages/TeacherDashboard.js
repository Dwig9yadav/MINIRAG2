import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { authAPI, ragAPI, usersAPI, feedbackAPI, analyticsAPI } from '../services/api';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rag-search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // User data
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [editName, setEditName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('male');
  
  // Teachers from API
  const [teachers, setTeachers] = useState([]);
  
  // Student analysis from API
  const [studentProblems, setStudentProblems] = useState([]);
  
  // Feedback
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('rag');
  const [myFeedback, setMyFeedback] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = authAPI.getCurrentUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUser(user);
      setUserName(user.name);
      setEditName(user.name);
      setSelectedAvatar(user.avatar || 'male');
      
      // Load teachers
      const teacherList = await usersAPI.getTeachers();
      setTeachers(teacherList.filter(t => t.id !== user.id));
      
      // Load trending topics (student problems)
      const trending = await ragAPI.getTrendingTopics();
      setStudentProblems(trending);
      
      // Load my feedback
      const feedback = await feedbackAPI.getMine();
      setMyFeedback(feedback);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await ragAPI.search(searchQuery);
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) return;
    try {
      await feedbackAPI.create({
        category: feedbackCategory,
        message: feedbackMessage
      });
      alert('Feedback sent to Admin successfully!');
      setFeedbackMessage('');
      // Reload feedback
      const feedback = await feedbackAPI.getMine();
      setMyFeedback(feedback);
    } catch (error) {
      alert('Failed to send feedback: ' + error.message);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="teacher-dashboard loading-screen">
        <AnimatedBackground />
        <div className="loading-content">Loading...</div>
      </div>
    );
  }

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
              <p className="user-id">Teacher ID: {currentUser?.institution_id || ''}</p>
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button className="search-btn" onClick={handleSearch} disabled={searching}>
                    <span>🔍</span> {searching ? 'Searching...' : 'Search with RAG'}
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
                {teachers.length > 0 ? teachers.map((teacher) => (
                  <div key={teacher.id} className="teacher-card">
                    <img 
                      src={teacher.avatar === 'female' ? '/images/female.png' : '/images/male.png'}
                      alt={teacher.name}
                      className="teacher-avatar-img"
                    />
                    <h3>{teacher.name}</h3>
                    <p className="teacher-subject">ID: {teacher.institution_id}</p>
                    <span className={`teacher-status ${teacher.status}`}>
                      {teacher.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                    </span>
                  </div>
                )) : (
                  <p className="no-data">No other teachers found</p>
                )}
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
