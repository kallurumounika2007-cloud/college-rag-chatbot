import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { faqAPI } from '../services/api';
import { useChat } from '../context/ChatContext';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Sparkles, 
  BookOpen, 
  DollarSign, 
  Calendar, 
  FileCheck, 
  Home, 
  Briefcase 
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Fees & Scholarships': DollarSign,
  'Academic Calendar': Calendar,
  'Admissions': FileCheck,
  'Hostel Life': Home,
  'Placements': Briefcase,
};

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const { sendMessage } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const res = await faqAPI.getFAQs();
        setFaqs(res.data);
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFaqs();
  }, []);

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAskInChat = (question) => {
    sendMessage(question);
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
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: 'var(--accent-glow)',
        }}>
          <Sparkles size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          College Knowledge Base & FAQs
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '560px', margin: '0 auto' }}>
          Frequently asked inquiries generated and verified from official college policies, schedules, and fee guidelines
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '500px', margin: '1.5rem auto 0', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search FAQs (e.g. fee, exam dates, hostel curfew)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.75rem', borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '2rem',
      }}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.825rem',
                fontWeight: isSelected ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading FAQs from knowledge base...
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <HelpCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <p>No matching FAQs found for your search term.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const Icon = CATEGORY_ICONS[faq.category] || HelpCircle;

            return (
              <div
                key={faq.id}
                className="glass-card"
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: isExpanded ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Question Header */}
                <div
                  onClick={() => toggleExpand(faq.id)}
                  style={{
                    padding: '1.15rem 1.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.35rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#818cf8',
                    }}>
                      <Icon size={16} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: isExpanded ? '#ffffff' : 'var(--text-primary)' }}>
                      {faq.question}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      {faq.category}
                    </span>
                    {isExpanded ? <ChevronUp size={18} color="#818cf8" /> : <ChevronDown size={18} color="#6b7280" />}
                  </div>
                </div>

                {/* Expanded Answer */}
                {isExpanded && (
                  <div style={{
                    padding: '1.25rem 1.35rem',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'rgba(15, 23, 42, 0.5)',
                    animation: 'fadeIn 0.2s ease-out',
                  }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: '1rem' }}>
                      {faq.answer}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px dashed rgba(255, 255, 255, 0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <BookOpen size={13} color="#818cf8" />
                        <span>Source Document: <strong>{faq.document_title}</strong></span>
                      </div>

                      <button
                        onClick={() => handleAskInChat(faq.question)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                      >
                        <MessageSquare size={13} />
                        <span>Ask Details in Chat</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FAQPage;
