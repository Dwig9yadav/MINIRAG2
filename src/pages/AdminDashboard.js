import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const [editName, setEditName] = useState('Admin');
  const [selectedAvatar, setSelectedAvatar] = useState('male');
  const [userFilter, setUserFilter] = useState('all');

  // Sample users data
  const [users, setUsers] = useState([
    { id: 1, name: 'Rahul Kumar', institutionId: '2415501001', role: 'student', avatar: 'male', status: 'active' },
    { id: 2, name: 'Priya Singh', institutionId: '2415501002', role: 'student', avatar: 'female', status: 'active' },
    { id: 3, name: 'Dr. Rajesh Kumar', institutionId: 'TCH001', role: 'teacher', avatar: 'male', status: 'active' },
    { id: 4, name: 'Prof. Meera Joshi', institutionId: 'TCH002', role: 'teacher', avatar: 'female', status: 'active' },
    { id: 5, name: 'Amit Sharma', institutionId: '2415501003', role: 'student', avatar: 'male', status: 'inactive' },
    { id: 6, name: 'Sneha Patel', institutionId: '2415501004', role: 'student', avatar: 'female', status: 'active' },
    { id: 7, name: 'Dr. Anil Verma', institutionId: 'TCH003', role: 'teacher', avatar: 'male', status: 'active' },
    { id: 8, name: 'Vikash Gupta', institutionId: '2415501005', role: 'student', avatar: 'male', status: 'active' },
  ]);

  // Sample teacher feedback
  const teacherFeedback = [
    { 
      id: 1, 
      teacher: 'Dr. Rajesh Kumar', 
      teacherId: 'TCH001',
      avatar: 'male',
      category: 'RAG Improvement', 
      message: 'The RAG system needs better Hindi language support. Students are struggling with translations.',
      date: 'Mar 1, 2026',
      status: 'pending'
    },
    { 
      id: 2, 
      teacher: 'Prof. Meera Joshi', 
      teacherId: 'TCH002',
      avatar: 'female',
      category: 'Feature Request', 
      message: 'Request for bulk PDF upload feature to add multiple course materials at once.',
      date: 'Feb 28, 2026',
      status: 'responded'
    },
    { 
      id: 3, 
      teacher: 'Dr. Anil Verma', 
      teacherId: 'TCH003',
      avatar: 'male',
      category: 'System Issue', 
      message: 'RAG search is slow during peak hours. Need performance optimization.',
      date: 'Feb 27, 2026',
      status: 'pending'
    },
    { 
      id: 4, 
      teacher: 'Prof. Sunita Sharma', 
      teacherId: 'TCH004',
      avatar: 'female',
      category: 'Content Suggestion', 
      message: 'Suggest adding video lecture integration with RAG for better comprehension.',
      date: 'Feb 25, 2026',
      status: 'responded'
    },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    alert(`User role updated to ${newRole}!`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    }
  };

  const filteredUsers = users.filter(user => {
    if (userFilter === 'all') return true;
    return user.role === userFilter;
  });

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
              <p className="user-id">Admin ID: ADMIN001</p>
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
                        src={user.avatar === 'male' ? '/images/male.png' : '/images/female.png'}
                        alt={user.name}
                        className="table-avatar"
                      />
                      <span>{user.name}</span>
                    </div>
                    <span className="id-cell">{user.institutionId}</span>
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
                {teacherFeedback.map((feedback) => (
                  <div key={feedback.id} className="feedback-card">
                    <div className="feedback-sender">
                      <img 
                        src={feedback.avatar === 'male' ? '/images/male.png' : '/images/female.png'}
                        alt={feedback.teacher}
                        className="feedback-avatar"
                      />
                      <div className="sender-details">
                        <p className="sender-name">{feedback.teacher}</p>
                        <p className="sender-id">ID: {feedback.teacherId}</p>
                      </div>
                      <span className={`feedback-status-badge ${feedback.status}`}>
                        {feedback.status === 'pending' ? '⏳ Pending' : '✓ Responded'}
                      </span>
                    </div>
                    <div className="feedback-content">
                      <div className="feedback-meta">
                        <span className="feedback-category">{feedback.category}</span>
                        <span className="feedback-date">{feedback.date}</span>
                      </div>
                      <p className="feedback-message">{feedback.message}</p>
                    </div>
                    <div className="feedback-actions">
                      <button className="respond-btn">📝 Respond</button>
                      <button className="archive-btn">📁 Archive</button>
                    </div>
                  </div>
                ))}
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
                    <p className="analytics-number">1,247</p>
                    <p className="analytics-label">Total RAG Queries</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <span className="analytics-icon">📚</span>
                  <div className="analytics-info">
                    <p className="analytics-number">156</p>
                    <p className="analytics-label">PDFs Indexed</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <span className="analytics-icon">🎯</span>
                  <div className="analytics-info">
                    <p className="analytics-number">92%</p>
                    <p className="analytics-label">RAG Accuracy</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <span className="analytics-icon">⚡</span>
                  <div className="analytics-info">
                    <p className="analytics-number">1.2s</p>
                    <p className="analytics-label">Avg Response Time</p>
                  </div>
                </div>
              </div>

              <h3>📈 Usage by Role</h3>
              <div className="usage-breakdown">
                <div className="usage-bar">
                  <div className="usage-label">Students</div>
                  <div className="usage-progress">
                    <div className="progress-fill student" style={{width: '65%'}}></div>
                  </div>
                  <span className="usage-percent">65%</span>
                </div>
                <div className="usage-bar">
                  <div className="usage-label">Teachers</div>
                  <div className="usage-progress">
                    <div className="progress-fill teacher" style={{width: '28%'}}></div>
                  </div>
                  <span className="usage-percent">28%</span>
                </div>
                <div className="usage-bar">
                  <div className="usage-label">Admins</div>
                  <div className="usage-progress">
                    <div className="progress-fill admin" style={{width: '7%'}}></div>
                  </div>
                  <span className="usage-percent">7%</span>
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
