import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          📝 <span>SelfQuiz</span>
        </NavLink>
        <div className="navbar-links" style={{ flex: 1, display: 'flex', gap: '1rem', marginLeft: '2rem' }}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Môn học
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
            Lịch sử
          </NavLink>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'var(--bg-input)',
                padding: '0.4rem 1rem',
                borderRadius: '2rem',
                border: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '1.2rem' }}>👤</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{user.username}</span>
                {user.role === 'ROLE_ADMIN' && <span style={{ fontSize: '0.7rem', background: 'var(--danger)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.3rem' }}>ADMIN</span>}
              </div>
              <button 
                onClick={logout}
                className="btn btn-outline" 
                style={{ padding: '0.4rem 1rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
