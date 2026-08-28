import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { 
  History, 
  Search, 
  MessageSquare, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Sparkles 
} from 'lucide-react';

const HistoryPage = () => {
  const { conversations, loadConversation, removeConversation } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredConversations = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.last_message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenConversation = (id) => {
    loadConversation(id);
    navigate('/chat');
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem',
      minHeight: 'calc(100vh - 70px)',
    }}>
      {/* Header */}
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
              <History size={20} color="#818cf8" />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Chat History</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Review, continue, or manage your past college AI inquiry sessions
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.4rem', paddingBlock: '0.55rem', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '3.5rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            {searchTerm ? 'No matching conversations found' : 'No chat history recorded yet'}
          </h3>
          <p style={{ fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchTerm ? 'Try searching for other keywords or terms.' : 'Start asking questions in the chat assistant to build your college knowledge history.'}
          </p>
          <button onClick={() => navigate('/chat')} className="btn btn-primary btn-sm">
            <span>Start a Chat</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
          {filteredConversations.map((conv) => {
            const formattedDate = new Date(conv.updated_at || conv.created_at).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = new Date(conv.updated_at || conv.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={conv.conversation_id}
                className="glass-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenConversation(conv.conversation_id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <MessageSquare size={16} color="#818cf8" style={{ flexShrink: 0 }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.title || 'Untitled Dialogue'}
                    </h4>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                      {conv.message_count} messages
                    </span>
                  </div>

                  {conv.last_message && (
                    <p style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '0.4rem',
                    }}>
                      {conv.last_message}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} />
                      {formattedDate}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} />
                      {formattedTime}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this entire conversation?')) {
                        removeConversation(conv.conversation_id);
                      }
                    }}
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'var(--text-muted)' }}
                    title="Delete conversation"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenConversation(conv.conversation_id);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <span>Resume</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
