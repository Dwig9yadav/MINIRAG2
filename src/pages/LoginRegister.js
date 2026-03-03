import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import './LoginRegister.css';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    institutionId: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend connection yet - just redirect to dashboard
    if (isLogin || formData.password === formData.confirmPassword) {
      navigate('/dashboard');
    } else {
      alert('Passwords do not match');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      institutionId: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleDemoLogin = () => {
    setFormData({
      institutionId: '24155012345',
      password: 'demo123'
    });
    setIsLogin(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 300);
  };

  const handleDemoTeacherLogin = () => {
    setFormData({
      institutionId: 'TCH001',
      password: 'teacher123'
    });
    setIsLogin(true);
    setTimeout(() => {
      navigate('/teacher-dashboard');
    }, 300);
  };

  const handleDemoAdminLogin = () => {
    setFormData({
      institutionId: 'ADMIN001',
      password: 'admin123'
    });
    setIsLogin(true);
    setTimeout(() => {
      navigate('/admin-dashboard');
    }, 300);
  };

  return (
    <div className="auth-page">
      <AnimatedBackground />
      <div className="auth-container">
        <div className="auth-header">
          <img src="/images/logo.png" alt="EduRag Logo" className="auth-logo-image" />
          <h1>EduRag</h1>
        </div>

        <div className="auth-box">
          <div className="form-toggle">
            <button 
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => !isLogin && toggleMode()}
            >
              Login
            </button>
            <button 
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => isLogin && toggleMode()}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="institutionId">Institution ID</label>
              <input
                type="text"
                id="institutionId"
                name="institutionId"
                placeholder="Format: 241550xxxx"
                value={formData.institutionId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>

                {/* Role selector removed - students default to student role */}
              </>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          {isLogin && (
            <div className="demo-buttons">
              <button 
                type="button"
                className="demo-btn student-demo"
                onClick={handleDemoLogin}
              >
                🎓 Student Demo (ID: 24155012345)
              </button>
              <button 
                type="button"
                className="demo-btn teacher-demo"
                onClick={handleDemoTeacherLogin}
              >
                👨‍🏫 Teacher Demo (ID: TCH001)
              </button>
              <button 
                type="button"
                className="demo-btn admin-demo"
                onClick={handleDemoAdminLogin}
              >
                👑 Admin Demo (ID: ADMIN001)
              </button>
            </div>
          )}

          <div className="form-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                className="toggle-link"
                onClick={toggleMode}
              >
                {isLogin ? 'Register here' : 'Login here'}
              </button>
            </p>
          </div>
        </div>

        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default LoginRegister;
