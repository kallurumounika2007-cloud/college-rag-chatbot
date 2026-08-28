import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  LogOut, 
  CheckCircle,
  Key
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Active';

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '3rem 1.5rem',
      minHeight: 'calc(100vh - 70px)',
    }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        {/* Profile Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: isAdmin ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '1.8rem',
            fontWeight: 800,
            boxShadow: 'var(--accent-glow)',
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                {user?.name}
              </h2>
              <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-student'}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Account Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Account Specifications
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={18} color="#818cf8" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{user?.name}</div>
              </div>
            </div>
            <CheckCircle size={16} color="#34d399" />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} color="#818cf8" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Email</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{user?.email}</div>
              </div>
            </div>
            <CheckCircle size={16} color="#34d399" />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={18} color={isAdmin ? '#f59e0b' : '#3b82f6'} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Role & Permissions</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {user?.role} Access Level
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={18} color="#818cf8" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Created</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{formattedDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <button onClick={() => navigate('/chat')} className="btn btn-secondary btn-sm">
            Back to Chat
          </button>

          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
