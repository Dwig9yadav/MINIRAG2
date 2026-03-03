import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rag-search');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userName, setUserName] = useState('John Doe');
  const [editName, setEditName] = useState('John Doe');
  const [selectedAvatar, setSelectedAvatar] = useState('male');

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard">
      <AnimatedBackground />
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/images/logo.png" alt="EduRag Logo" className="sidebar-logo" />
          <h2>EduRag</h2>
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
            className={`nav-item ${activeTab === 'buddies' ? 'active' : ''}`}
            onClick={() => setActiveTab('buddies')}
          >
            <span className="nav-icon">👥</span>
            <span>Buddies</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <span className="nav-icon">💬</span>
            <span>Feedback</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <span className="nav-icon">📊</span>
            <span>Analysis</span>
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
              <p className="user-id">241550xxxx</p>
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
                className="close-modal-btn"
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
          <h1>Student Dashboard</h1>
          <div className="top-bar-actions">
            <input
              type="text"
              placeholder="Quick search..."
              className="search-input"
            />
            <button className="help-btn" title="Help">
              ?
            </button>
          </div>
        </header>

        <div className="content-area">
          {/* RAG Search Tab */}
          {activeTab === 'rag-search' && (
            <section className="tab-content rag-search-section">
              <h2>RAG Search</h2>
              <div className="search-container">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Ask a question about your PDFs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="large-search-input"
                  />
                  <button className="search-btn">
                    <span>🔍</span> Search
                  </button>
                </div>

                <div className="language-selector">
                  <label>Language Preference:</label>
                  <select>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Hinglish</option>
                  </select>
                </div>
              </div>

              <div className="search-results">
                <h3>Quick Tips</h3>
                <div className="tips-grid">
                  <div className="tip-card">
                    <span className="tip-icon">💡</span>
                    <p>Use specific keywords for better results</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">📚</span>
                    <p>Search across all your uploaded PDFs</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">🎯</span>
                    <p>Get AI-powered answers instantly</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">🌍</span>
                    <p>Support for multiple languages</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Buddies Tab */}
          {activeTab === 'buddies' && (
            <section className="tab-content buddies-section">
              <h2>Student Buddies</h2>
              <div className="buddies-grid">
                {[1, 2, 3, 4, 5, 6].map((buddy) => (
                  <div key={buddy} className="buddy-card">
                    <img 
                      src={buddy % 2 === 0 ? '/images/female.png' : '/images/male.png'}
                      alt={buddy % 2 === 0 ? 'female' : 'male'}
                      className="buddy-avatar-img"
                    />
                    <h3>Student {buddy}</h3>
                    <p className="buddy-id">ID: 241550{1000 + buddy}</p>
                    <p className="buddy-status">Active</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <section className="tab-content feedback-section">
              <h2>Share Feedback</h2>
              <div className="feedback-form">
                <div className="form-group">
                  <label>Feedback Message</label>
                  <textarea
                    placeholder="Share your feedback with teachers..."
                    rows="6"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Show Your Identity?</label>
                  <div className="toggle-switch">
                    <input type="checkbox" id="identity-toggle" />
                    <label htmlFor="identity-toggle">Anonymous</label>
                    <span className="toggle-slider"></span>
                  </div>
                </div>

                <button className="submit-feedback-btn">Send Feedback</button>
              </div>

              <div className="feedback-history">
                <h3>Your Previous Feedback</h3>
                <div className="feedback-list">
                  <div className="feedback-item">
                    <p className="feedback-text">Great teaching materials, very helpful!</p>
                    <p className="feedback-time">2 days ago</p>
                  </div>
                  <div className="feedback-item">
                    <p className="feedback-text">Could you explain chapter 5 in more detail?</p>
                    <p className="feedback-time">1 week ago</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <section className="tab-content analysis-section">
              <h2>Learning Analytics</h2>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Search Activity</h3>
                  <div className="metric">
                    <p className="metric-label">Total Searches</p>
                    <p className="metric-value">47</p>
                  </div>
                  <p className="metric-description">This week</p>
                </div>

                <div className="analytics-card">
                  <h3>Accuracy Score</h3>
                  <div className="metric">
                    <p className="metric-label">Faithfulness</p>
                    <p className="metric-value">92%</p>
                  </div>
                  <p className="metric-description">Answer grounding score</p>
                </div>

                <div className="analytics-card">
                  <h3>Citations Used</h3>
                  <div className="metric">
                    <p className="metric-label">Verified Citations</p>
                    <p className="metric-value">38</p>
                  </div>
                  <p className="metric-description">From your searches</p>
                </div>

                <div className="analytics-card">
                  <h3>Learning Time</h3>
                  <div className="metric">
                    <p className="metric-label">Total Hours</p>
                    <p className="metric-value">24h</p>
                  </div>
                  <p className="metric-description">This month</p>
                </div>
              </div>

              <div className="insights-section">
                <h3>Insights</h3>
                <div className="insight-card">
                  <span>📈</span>
                  <p>You've been most active on weekdays between 2-4 PM</p>
                </div>
                <div className="insight-card">
                  <span>⭐</span>
                  <p>Your answer evaluation metrics show high consistency</p>
                </div>
                <div className="insight-card">
                  <span>📚</span>
                  <p>You're tracking well with course material</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
