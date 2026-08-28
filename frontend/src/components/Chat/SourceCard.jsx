import React from 'react';
import { FileText, ExternalLink, Bookmark } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const SourceCard = ({ source }) => {
  const { setSelectedSource } = useChat();

  const relevancePercentage = source.score ? Math.round(source.score * 100) : null;

  return (
    <div
      onClick={() => setSelectedSource(source)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(30, 41, 59, 0.75)',
        border: '1px solid var(--border-active)',
        color: 'var(--text-primary)',
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.borderColor = '#818cf8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.75)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'var(--border-active)';
      }}
      title="Click to view full source document excerpt"
    >
      <FileText size={14} color="#818cf8" />
      <span style={{ fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {source.document_title || 'Document'}
      </span>
      {source.page_number && (
        <span style={{
          background: 'rgba(99, 102, 241, 0.2)',
          color: '#a5b4fc',
          padding: '0.1rem 0.35rem',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: 700
        }}>
          p.{source.page_number}
        </span>
      )}
      {relevancePercentage !== null && (
        <span style={{
          fontSize: '0.7rem',
          color: relevancePercentage > 75 ? '#34d399' : '#fbbf24',
          fontWeight: 600,
        }}>
          {relevancePercentage}%
        </span>
      )}
      <ExternalLink size={12} style={{ opacity: 0.6 }} />
    </div>
  );
};

export default SourceCard;
