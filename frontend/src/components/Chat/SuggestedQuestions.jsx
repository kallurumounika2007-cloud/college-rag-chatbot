import React from 'react';
import { useChat } from '../../context/ChatContext';
import { 
  Sparkles, 
  DollarSign, 
  Calendar, 
  FileCheck, 
  Home, 
  Award, 
  Briefcase,
  HelpCircle
} from 'lucide-react';

const SuggestedQuestions = () => {
  const { sendMessage } = useChat();

  const suggestions = [
    {
      category: 'Tuition & Fees',
      icon: DollarSign,
      color: '#34d399',
      query: 'What is the annual tuition fee structure for CSE and AI & DS branches?',
    },
    {
      category: 'Academic Schedule',
      icon: Calendar,
      color: '#60a5fa',
      query: 'When are the Autumn and Spring semester theory examinations scheduled?',
    },
    {
      category: 'Admission Guidelines',
      icon: FileCheck,
      color: '#f472b6',
      query: 'What documents are required for admission verification?',
    },
    {
      category: 'Hostel & Amenities',
      icon: Home,
      color: '#fbbf24',
      query: 'What are the hostel curfew timings and dining mess hours?',
    },
    {
      category: 'Placements & CTC',
      icon: Briefcase,
      color: '#a78bfa',
      query: 'What is the average placement package and which top companies recruit on campus?',
    },
    {
      category: 'Scholarships',
      icon: Award,
      color: '#38bdf8',
      query: 'What are the eligibility criteria for the Chairman’s Merit Scholarship?',
    },
  ];

  return (
    <div style={{
      maxWidth: '850px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      textAlign: 'center',
    }}>
      {/* Hero Welcome Banner */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        background: 'var(--accent-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem',
        boxShadow: '0 0 35px rgba(99, 102, 241, 0.45)',
      }}>
        <Sparkles size={32} color="#ffffff" />
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        How can I help you today?
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
        I can answer questions about academic schedules, fees, scholarships, hostels, admissions, and campus placements grounded directly in official college documents.
      </p>

      {/* Suggested Prompt Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.85rem',
        textAlign: 'left',
      }}>
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass-card"
              onClick={() => sendMessage(item.query)}
              style={{
                padding: '1rem 1.15rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '100px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{
                  padding: '0.35rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                }}>
                  <Icon size={16} color={item.color} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {item.category}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
                "{item.query}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
