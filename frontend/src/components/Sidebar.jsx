import React from 'react';
import { useChat } from '../context/ChatContext';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Sparkles, 
  Clock, 
  GraduationCap,
  Calendar,
  DollarSign,
  FileCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { 
    conversations, 
    currentConversationId, 
    loadConversation, 
    startNewChat, 
    removeConversation,
    loadingConversations,
    sendMessage 
  } = useChat();

  const handleSelectConv = (id) => {
    loadConversation(id);
    if (onClose) onClose();
  };

  const quickTopics = [
    { label: 'Exam Schedules', query: 'When are the end-semester examinations?', icon: Calendar },
    { label: 'CSE Fee Structure', query: 'What is the annual tuition fee for CSE students?', icon: DollarSign },
    { label: 'Admission Documents', query: 'What documents are required for admission verification?', icon: FileCheck },
    { label: 'Hostel Curfew & Mess', query: 'What are the hostel curfew timings and mess meal hours?', icon: Clock },
    { label: 'Placement Criteria', query: 'What is the minimum CGPA and eligibility for placements?', icon: GraduationCap },
  ];

  return (
    <aside style={{
      width: '280px',
      height: '100%',
      background: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem 1rem',
      flexShrink: 0,
      zIndex: 30,
    }}>
      {/* New Chat Button */}
      <button
        onClick={startNewChat}
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
        }}
      >
        <Plus size={18} />
        <span>New Conversation</span>
      </button>

      {/* Conversations Section */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.5rem 0.4rem',
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Recent Dialogues
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
            {conversations.length}
          </span>
        </div>

        {loadingConversations ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Loading history...
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ 
            padding: '1.5rem 1rem', 
            textAlign: 'center', 
            color: 'var(--text-muted)', 
            fontSize: '0.85rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)'
          }}>
            <MessageSquare size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p>No conversations yet.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Ask your first college question!</p>
          </div>
        ) : (
          conversations.map((c) => {
            const isSelected = c.conversation_id === currentConversationId;
            return (
              <div
                key={c.conversation_id}
                onClick={() => handleSelectConv(c.conversation_id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-active)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  group: 'conv-item'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                  <MessageSquare size={16} color={isSelected ? '#818cf8' : '#6b7280'} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.85rem',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {c.title || 'Untitled Chat'}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this conversation?')) {
                      removeConversation(c.conversation_id);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    display: 'flex',
                    opacity: isSelected ? 0.8 : 0.3,
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = isSelected ? 0.8 : 0.3)}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Suggested Quick Topics at bottom */}
      <div style={{
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.6rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#818cf8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Sparkles size={13} />
          <span>Quick College Topics</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {quickTopics.slice(0, 3).map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => sendMessage(item.query)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Icon size={13} style={{ flexShrink: 0, color: '#818cf8' }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
