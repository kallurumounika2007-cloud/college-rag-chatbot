import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, documentAPI } from '../services/api';
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  UploadCloud, 
  Database,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ThumbsUp,
  Award,
  PieChart
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeedSamples = async () => {
    setSeeding(true);
    setSeedMessage('');
    try {
      const res = await documentAPI.seedSampleDocuments();
      setSeedMessage(res.data.message);
      await fetchData();
    } catch (err) {
      setSeedMessage(err.response?.data?.detail || 'Failed to seed sample documents.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#818cf8', animation: 'spin 1s linear infinite' }} />
        <p>Loading Administrator Dashboard analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Documents',
      value: stats?.total_documents || 0,
      icon: FileText,
      color: '#6366f1',
      subtext: `${stats?.document_status_breakdown?.ready || 0} active in knowledge base`,
    },
    {
      title: 'Vector Embeddings',
      value: stats?.total_chunks || 0,
      icon: Layers,
      color: '#3b82f6',
      subtext: 'Indexed semantic chunks',
    },
    {
      title: 'Total Conversations',
      value: stats?.total_conversations || 0,
      icon: MessageSquare,
      color: '#10b981',
      subtext: `${stats?.total_messages || 0} queries handled`,
    },
    {
      title: 'Registered Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: '#f59e0b',
      subtext: `${stats?.total_students || 0} students · ${stats?.total_admins || 0} admins`,
    },
    {
      title: 'Student Satisfaction',
      value: `${stats?.satisfaction_rate ?? 100}%`,
      icon: ThumbsUp,
      color: '#10b981',
      subtext: `${stats?.positive_feedback_count || 0} helpful · ${stats?.negative_feedback_count || 0} reported`,
    },
  ];

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem',
      minHeight: 'calc(100vh - 70px)',
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <div style={{
              padding: '0.4rem',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
            }}>
              <LayoutDashboard size={20} color="#818cf8" />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Administrator Dashboard</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            RAG Knowledge Base metrics, document indexing status, and student usage telemetry
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/documents"
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UploadCloud size={16} />
            <span>Manage Documents</span>
          </Link>
        </div>
      </div>

      {/* Seed Alert banner if 0 documents */}
      {stats?.total_documents === 0 && (
        <div className="glass-panel" style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid #818cf8',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#fbbf24" />
              Populate Initial Knowledge Base
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Load standard sample documents (Academic Calendar, Fee Structure, Admission Guidelines, Hostel Rules, Placement Policy) with 1-click.
            </p>
          </div>

          <button
            onClick={handleSeedSamples}
            disabled={seeding}
            className="btn btn-primary btn-sm"
          >
            <span>{seeding ? 'Indexing Documents...' : 'Load Sample Documents'}</span>
          </button>
        </div>
      )}

      {seedMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--success-bg)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
        }}>
          ✓ {seedMessage}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {card.title}
                </span>
                <div style={{
                  padding: '0.5rem',
                  borderRadius: '10px',
                  background: `${card.color}20`,
                }}>
                  <Icon size={20} color={card.color} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1, marginBottom: '0.5rem' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Pipeline Overview & Users */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* RAG Engine Status */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>RAG Pipeline Architecture</h3>
            <span className="badge badge-success">Online & Ready</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Database size={16} color="#818cf8" />
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>ChromaDB Vector Store</span>
              </div>
              <span className="badge badge-primary">{stats?.total_chunks || 0} Chunks Indexed</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle size={16} color="#34d399" />
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Active Documents</span>
              </div>
              <span className="badge badge-ready">{stats?.document_status_breakdown?.ready || 0} Ready</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={16} color="#f59e0b" />
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Embeddings & LLM Synthesis</span>
              </div>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                Hybrid Auto-Fallback
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <Link
              to="/admin/documents"
              style={{
                fontSize: '0.85rem',
                color: '#818cf8',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>Manage Documents & Indexing</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Registered Users Preview */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Registered Users ({users.length})</h3>
            <span className="badge badge-primary">{stats?.total_students || 0} Students</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '250px', overflowY: 'auto' }}>
            {users.map((u) => (
              <div
                key={u.user_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-student'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Document Breakdown */}
      {stats?.department_breakdown && Object.keys(stats.department_breakdown).length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PieChart size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Department-wise Knowledge Base</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {Object.entries(stats.department_breakdown).map(([dept, count]) => {
              const colors = {
                Admissions: '#6366f1',
                CSE: '#3b82f6',
                Hostel: '#f59e0b',
                Placements: '#10b981',
                General: '#8b5cf6',
                ECE: '#06b6d4',
              };
              const bg = colors[dept] || '#6b7280';
              return (
                <div
                  key={dept}
                  style={{
                    flex: '1 1 160px',
                    background: `${bg}15`,
                    border: `1px solid ${bg}40`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{dept}</span>
                  <span style={{
                    background: `${bg}30`,
                    color: bg,
                    borderRadius: 'var(--radius-full)',
                    padding: '0.1rem 0.55rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}>
                    {count} docs
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
