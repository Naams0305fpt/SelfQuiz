import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }
    
    try {
      await login({ username, password });
      setUsername('');
      setPassword('');
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (e) {
      toast.error('Sai tên đăng nhập hoặc mật khẩu');
      setPassword('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đăng Nhập</h2>
          <p>Chào mừng trở lại với SelfQuiz</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              className="form-input"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="form-input"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Đăng Nhập</button>
        </form>
        <div className="auth-footer">
          <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
