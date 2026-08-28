import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, FileText, Bookmark, CheckCircle2, Award, Search, Copy, Check } from 'lucide-react';

const highlightKeywords = (text, query) => {
  if (!query || !text) return text;
  const terms = query.split(/\s+/).filter(t => t.length > 2);
  if (terms.length === 0) return text;

  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} style={{ background: 'rgba(251, 191, 36, 0.35)', color: '#fbbf24', padding: '0.1rem 0.2rem', borderRadius: '3px' }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const SourceModal = () => {
  const { selectedSource, setSelectedSource } = useChat();
  const [copied, setCopied] = useState(false);
  const [highlightTerm, setHighlightTerm] = useState('');

  if (!selectedSource) return null;

  const scorePct = selectedSource.score ? Math.round(selectedSource.score * 100) : null;
  const contentText = selectedSource.excerpt || selectedSource.content || 'No text snippet available.';

  const handleCopy = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      zIndex: 100,
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(30, 41, 59, 0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={20} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                {selectedSource.document_title || 'Document Excerpt'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Department: {selectedSource.department || 'General'} · ID: {selectedSource.document_id}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedSource(null)}
            className="btn btn-ghost btn-icon"
            style={{ borderRadius: '50%', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Metadata Badges & Search Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.6rem',
          padding: '0.85rem 1.5rem',
          background: 'rgba(17, 24, 39, 0.4)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="badge badge-primary">
              Page: {selectedSource.page_number || 'N/A'}
            </span>
            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0' }}>
              Chunk #{selectedSource.chunk_index ?? 0}
            </span>
            {scorePct !== null && (
              <span className={`badge ${scorePct >= 75 ? 'badge-ready' : 'badge-warning'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Award size={12} />
                Match Confidence: {scorePct}%
              </span>
            )}
          </div>

          {/* Quick in-modal search highlight */}
          <div style={{ position: 'relative', width: '180px' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Highlight text..."
              value={highlightTerm}
              onChange={(e) => setHighlightTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '1.8rem', paddingBlock: '0.25rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>

        {/* Body / Extracted Context with Highlighting */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
        }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#818cf8',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={14} />
              <span>Grounded Text Segment Used by Hybrid Vector Pipeline</span>
            </div>

            <button
              onClick={handleCopy}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.45rem' }}
            >
              {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-primary)',
          }}>
            {highlightKeywords(contentText, highlightTerm)}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(30, 41, 59, 0.4)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Indexed in local ChromaDB persistent collection
          </span>
          <button onClick={() => setSelectedSource(null)} className="btn btn-secondary btn-sm">
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceModal;
