import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  BookOpen, 
  History, 
  LayoutDashboard, 
  FileText, 
  User as UserIcon, 
  LogOut, 
  Sparkles,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 1.75rem',
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Brand / Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--accent-glow)',
        }}>
          <Bot size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Apex<span style={{ color: '#818cf8' }}>AI</span>
            </span>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
              RAG v1.0
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1 }}>
            Official College Knowledge Assistant
          </p>
        </div>
      </Link>

      {/* Navigation Links */}
      {user && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to="/chat"
            className={`btn btn-sm ${isActive('/chat') ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Bot size={16} />
            <span>Chat</span>
          </Link>

          <Link
            to="/history"
            className={`btn btn-sm ${isActive('/history') ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <History size={16} />
            <span>Chat History</span>
          </Link>

          <Link
            to="/faqs"
            className={`btn btn-sm ${isActive('/faqs') ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <HelpCircle size={16} />
            <span>FAQs</span>
          </Link>

          {isAdmin && (
            <>
              <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 0.25rem' }} />
              <Link
                to="/admin"
                className={`btn btn-sm ${isActive('/admin') ? 'btn-primary' : 'btn-ghost'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/documents"
                className={`btn btn-sm ${isActive('/admin/documents') ? 'btn-primary' : 'btn-ghost'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FileText size={16} />
                <span>Knowledge Base</span>
              </Link>
            </>
          )}
        </nav>
      )}

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link 
              to="/profile" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                textDecoration: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(31, 41, 55, 0.7)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: isAdmin ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.name?.split(' ')[0]}
              </span>
              <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-student'}`}>
                {user.role}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-icon"
              title="Log out"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-sm btn-ghost">Log In</Link>
            <Link to="/register" className="btn btn-sm btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
