import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { authAPI, usersAPI, feedbackAPI, analyticsAPI, ragAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
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
  const [userFilter, setUserFilter] = useState('all');

  // Users from API
  const [users, setUsers] = useState([]);
  
  // Feedback from API
  const [teacherFeedback, setTeacherFeedback] = useState([]);
  
  // Analytics from API
  const [analytics, setAnalytics] = useState(null);

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
      
      // Load all users
      const userList = await usersAPI.getAll();
      setUsers(userList);
      
      // Load feedback
      const feedback = await feedbackAPI.getAll();
      setTeacherFeedback(feedback);
      
      // Load analytics
      const stats = await analyticsAPI.getSummary();
      setAnalytics(stats);
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

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      alert(`User role updated to ${newRole}!`);
    } catch (error) {
      alert('Failed to update role: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.delete(userId);
        setUsers(users.filter(user => user.id !== userId));
        alert('User deleted successfully!');
      } catch (error) {
        alert('Failed to delete user: ' + error.message);
      }
    }
  };

  const handleRespondFeedback = async (feedbackId, response) => {
    try {
      await feedbackAPI.respond(feedbackId, response);
      const feedback = await feedbackAPI.getAll();
      setTeacherFeedback(feedback);
      alert('Response sent!');
    } catch (error) {
      alert('Failed to respond: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    if (userFilter === 'all') return true;
    return user.role === userFilter;
  });

  if (loading) {
    return (
      <div className="admin-dashboard loading-screen">
        <AnimatedBackground />
        <div className="loading-content">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AnimatedBackground />
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/images/logo.png" alt="EduRag Logo" className="sidebar-logo" />
          <h2>EduRag</h2>
        </div>

        <div className="role-badge admin">
          <span>👑</span> Admin Portal
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            <span>User Management</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <span className="nav-icon">💬</span>
            <span>Teacher Feedback</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'rag-search' ? 'active' : ''}`}
            onClick={() => setActiveTab('rag-search')}
          >
            <span className="nav-icon">🔍</span>
            <span>RAG Search</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="nav-icon">📊</span>
            <span>System Analytics</span>
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
              <p className="user-id">Admin ID: {currentUser?.institution_id || ''}</p>
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
          <h1>Admin Dashboard</h1>
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
          {/* User Management Tab */}
          {activeTab === 'users' && (
            <section className="tab-content">
              <h2>👥 User Management</h2>
              <p className="section-desc">Manage users, change roles, and delete accounts</p>
              
              <div className="user-controls">
                <div className="filter-group">
                  <label>Filter by Role:</label>
                  <select 
                    value={userFilter} 
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Users</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div className="user-stats-mini">
                  <span className="stat-pill">👥 {users.length} Total</span>
                  <span className="stat-pill student">🎓 {users.filter(u => u.role === 'student').length} Students</span>
                  <span className="stat-pill teacher">👨‍🏫 {users.filter(u => u.role === 'teacher').length} Teachers</span>
                </div>
              </div>

              <div className="users-table">
                <div className="table-header">
                  <span>User</span>
                  <span>ID</span>
                  <span>Current Role</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {filteredUsers.map((user) => (
                  <div key={user.id} className="table-row">
                    <div className="user-cell">
                      <img 
                        src={user.avatar === 'female' ? '/images/female.png' : '/images/male.png'}
                        alt={user.name}
                        className="table-avatar"
                      />
                      <span>{user.name}</span>
                    </div>
                    <span className="id-cell">{user.institution_id}</span>
                    <span className={`role-cell ${user.role}`}>
                      {user.role === 'student' ? '🎓' : user.role === 'teacher' ? '👨‍🏫' : '👑'} {user.role}
                    </span>
                    <span className={`status-cell ${user.status}`}>
                      {user.status === 'active' ? '🟢' : '🔴'} {user.status}
                    </span>
                    <div className="actions-cell">
                      <select 
                        className="role-select"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Teacher Feedback Tab */}
          {activeTab === 'feedback' && (
            <section className="tab-content">
              <h2>💬 Teacher Feedback</h2>
              <p className="section-desc">View and manage feedback from teachers (non-anonymous)</p>
              
              <div className="feedback-stats">
                <div className="feedback-stat-card">
                  <span className="stat-number">{teacherFeedback.length}</span>
                  <span className="stat-label">Total Feedback</span>
                </div>
                <div className="feedback-stat-card pending">
                  <span className="stat-number">{teacherFeedback.filter(f => f.status === 'pending').length}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="feedback-stat-card responded">
                  <span className="stat-number">{teacherFeedback.filter(f => f.status === 'responded').length}</span>
                  <span className="stat-label">Responded</span>
                </div>
              </div>

              <div className="feedback-list">
                {teacherFeedback.length > 0 ? teacherFeedback.map((feedback) => (
                  <div key={feedback.id} className="feedback-card">
                    <div className="feedback-sender">
                      <img 
                        src={feedback.sender_avatar === 'female' ? '/images/female.png' : '/images/male.png'}
                        alt={feedback.sender_name}
                        className="feedback-avatar"
                      />
                      <div className="sender-details">
                        <p className="sender-name">{feedback.sender_name}</p>
                        <p className="sender-id">ID: {feedback.sender_institution_id}</p>
                      </div>
                      <span className={`feedback-status-badge ${feedback.status}`}>
                        {feedback.status === 'pending' ? '⏳ Pending' : feedback.status === 'responded' ? '✓ Responded' : '📁 Archived'}
                      </span>
                    </div>
                    <div className="feedback-content">
                      <div className="feedback-meta">
                        <span className="feedback-category">{feedback.category}</span>
                        <span className="feedback-date">{new Date(feedback.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="feedback-message">{feedback.message}</p>
                      {feedback.admin_response && (
                        <div className="admin-response">
                          <strong>Response:</strong> {feedback.admin_response}
                        </div>
                      )}
                    </div>
                    {feedback.status === 'pending' && (
                      <div className="feedback-actions">
                        <button 
                          className="respond-btn"
                          onClick={() => {
                            const response = prompt('Enter your response:');
                            if (response) handleRespondFeedback(feedback.id, response);
                          }}
                        >📝 Respond</button>
                      </div>
                    )}
                  </div>
                )) : (
                  <p className="no-data">No feedback received yet</p>
                )}
              </div>
            </section>
          )}

          {/* RAG Search Tab */}
          {activeTab === 'rag-search' && (
            <section className="tab-content">
              <h2>🔍 RAG Search - System Wide</h2>
              <p className="section-desc">Search across all PDFs and content in the system</p>
              
              <div className="search-container">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search all system content, PDFs, feedback, and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="large-search-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button className="search-btn" onClick={handleSearch} disabled={searching}>
                    <span>🔍</span> {searching ? 'Searching...' : 'Search with RAG'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="search-results">
                    <h3>Search Results</h3>
                    {searchResults.map((result, idx) => (
                      <div key={idx} className="result-card">
                        <div className="result-header">
                          <span className="result-source">{result.source}</span>
                          <span className="result-score">{Math.round(result.relevance_score * 100)}%</span>
                        </div>
                        <p>{result.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="language-selector">
                  <label>Language Preference:</label>
                  <select defaultValue="english">
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>

                <h3>📂 Search Scope</h3>
                <div className="tips-grid">
                  <div className="tip-card">
                    <span className="tip-icon">📄</span>
                    <p>All Uploaded PDFs</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">💬</span>
                    <p>Teacher Feedback</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">📊</span>
                    <p>System Analytics</p>
                  </div>
                  <div className="tip-card">
                    <span className="tip-icon">👥</span>
                    <p>User Data</p>
                  </div>
                </div>

                <h3>🕐 Recent Admin Searches</h3>
                <div className="recent-searches">
                  <div className="recent-search-item">
                    <span>🔍</span>
                    <p>"student performance analytics"</p>
                    <span className="search-time">1 hour ago</span>
                  </div>
                  <div className="recent-search-item">
                    <span>🔍</span>
                    <p>"RAG accuracy reports"</p>
                    <span className="search-time">Yesterday</span>
                  </div>
                  <div className="recent-search-item">
                    <span>🔍</span>
                    <p>"teacher feedback summary"</p>
                    <span className="search-time">2 days ago</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* System Analytics Tab */}
          {activeTab === 'analytics' && (
            <section className="tab-content">
              <h2>📊 System Analytics</h2>
              <p className="section-desc">Overview of RAG system performance and usage</p>
              
              <div className="analytics-stats">
                <div className="analytics-card">
                  <span className="analytics-icon">📈</span>
                  <div className="analytics-info">
                    <p className="analytics-number">{analytics?.total_searches || 0}</p>
                    <p className="analytics-label">Total RAG Queries</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <span className="analytics-icon">📚</span>
                  <div className="analytics-info">
                    <p className="analytics-number">{analytics?.total_pdfs || 0}</p>
                    <p className="analytics-label">PDFs Indexed</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <span className="analytics-icon">👥</span>
                  <div className="analytics-info">
                    <p className="analytics-number">{analytics?.total_users || 0}</p>
                    <p className="analytics-label">Total Users</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <span className="analytics-icon">💬</span>
                  <div className="analytics-info">
                    <p className="analytics-number">{analytics?.pending_feedback || 0}</p>
                    <p className="analytics-label">Pending Feedback</p>
                  </div>
                </div>
              </div>

              <h3>📈 User Breakdown</h3>
              <div className="usage-breakdown">
                <div className="usage-bar">
                  <div className="usage-label">Students</div>
                  <div className="usage-progress">
                    <div className="progress-fill student" style={{width: `${(users.filter(u => u.role === 'student').length / Math.max(users.length, 1)) * 100}%`}}></div>
                  </div>
                  <span className="usage-percent">{users.filter(u => u.role === 'student').length}</span>
                </div>
                <div className="usage-bar">
                  <div className="usage-label">Teachers</div>
                  <div className="usage-progress">
                    <div className="progress-fill teacher" style={{width: `${(users.filter(u => u.role === 'teacher').length / Math.max(users.length, 1)) * 100}%`}}></div>
                  </div>
                  <span className="usage-percent">{users.filter(u => u.role === 'teacher').length}</span>
                </div>
                <div className="usage-bar">
                  <div className="usage-label">Admins</div>
                  <div className="usage-progress">
                    <div className="progress-fill admin" style={{width: `${(users.filter(u => u.role === 'admin').length / Math.max(users.length, 1)) * 100}%`}}></div>
                  </div>
                  <span className="usage-percent">{users.filter(u => u.role === 'admin').length}</span>
                </div>
              </div>

              <h3>🌐 Language Distribution</h3>
              <div className="language-stats">
                <div className="lang-card">
                  <span className="lang-emoji">🇬🇧</span>
                  <p className="lang-name">English</p>
                  <p className="lang-percent">58%</p>
                </div>
                <div className="lang-card">
                  <span className="lang-emoji">🇮🇳</span>
                  <p className="lang-name">Hindi</p>
                  <p className="lang-percent">27%</p>
                </div>
                <div className="lang-card">
                  <span className="lang-emoji">🔀</span>
                  <p className="lang-name">Hinglish</p>
                  <p className="lang-percent">15%</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
