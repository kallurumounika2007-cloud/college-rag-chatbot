import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sparkles, 
  Award,
  ArrowRight
} from 'lucide-react';
import SourceCard from './SourceCard';
import { useChat } from '../../context/ChatContext';

const formatMessageContent = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const italicLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');

    if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ')) {
      const cleanBullet = italicLine.replace(/^[\s•\-\*]+/, '');
      return (
        <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '0.35rem' }} dangerouslySetInnerHTML={{ __html: cleanBullet }} />
      );
    }

    if (line.trim().startsWith('#')) {
      const cleanHeading = italicLine.replace(/^#+\s*/, '');
      return (
        <h4 key={idx} style={{ margin: '0.8rem 0 0.4rem', color: '#818cf8', fontSize: '1rem', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: cleanHeading }} />
      );
    }

    if (!line.trim()) {
      return <div key={idx} style={{ height: '0.5rem' }} />;
    }

    return (
      <p key={idx} style={{ marginBottom: '0.5rem', lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: italicLine }} />
    );
  });
};

const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'assistant';
  const { submitFeedback, sendMessage } = useChat();
  const [feedback, setFeedback] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop TTS if component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleFeedback = async (isPositive) => {
    if (feedback || submittingFeedback) return;
    setSubmittingFeedback(true);
    const success = await submitFeedback(message.message_id, isPositive);
    if (success) {
      setFeedback(isPositive ? 'positive' : 'negative');
    }
    setSubmittingFeedback(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech audio is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel(); // Stop any other audio
      // Clean markdown tags for natural speech
      const plainText = message.content.replace(/[\*\#\•\_]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const formattedTime = new Date(message.created_at || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.75rem',
        maxWidth: '850px',
        width: '100%',
        margin: '0 auto 1.75rem',
        padding: '0 1rem',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: isBot ? 'var(--accent-gradient)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: isBot ? 'var(--accent-glow)' : 'none',
      }}>
        {isBot ? <Bot size={20} color="#ffffff" /> : <User size={19} color="#ffffff" />}
      </div>

      {/* Message Content Container */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header (Sender name + time + confidence badge) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isBot ? '#818cf8' : 'var(--text-primary)' }}>
              {isBot ? 'Apex AI Assistant' : 'You'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {formattedTime}
            </span>
            {isBot && (
              <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                Hybrid RAG
              </span>
            )}
          </div>

          {/* Assistant Action Buttons: TTS & Copy */}
          {isBot && !message.message_id?.startsWith('err_') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={toggleSpeech}
                className="btn btn-ghost btn-icon"
                style={{ color: isSpeaking ? '#818cf8' : 'var(--text-muted)', padding: '0.25rem' }}
                title={isSpeaking ? 'Stop voice readout' : 'Read answer aloud (Text-to-Speech)'}
              >
                {isSpeaking ? <VolumeX size={15} color="#818cf8" /> : <Volume2 size={15} />}
              </button>

              <button
                onClick={handleCopy}
                className="btn btn-ghost btn-icon"
                style={{ color: copied ? '#34d399' : 'var(--text-muted)', padding: '0.25rem' }}
                title="Copy response"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
          )}
        </div>

        {/* Bubble Box */}
        <div
          style={{
            background: isBot ? 'rgba(30, 41, 59, 0.65)' : 'rgba(99, 102, 241, 0.12)',
            border: isBot ? '1px solid var(--border-subtle)' : '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem 1.25rem',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            boxShadow: 'var(--shadow-sm)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Text */}
          <div style={{ wordBreak: 'break-word' }}>
            {formatMessageContent(message.content)}
          </div>

          {/* Sources Section if Bot Message */}
          {isBot && message.sources && message.sources.length > 0 && (
            <div style={{
              marginTop: '1.25rem',
              paddingTop: '0.9rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.6rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  <BookOpen size={13} color="#818cf8" />
                  <span>Verified College Sources ({message.sources.length}):</span>
                </div>

                {message.confidence && (
                  <span className={`badge ${message.confidence === 'High' ? 'badge-ready' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                    <Award size={11} />
                    {message.confidence} Match
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {message.sources.map((src, sIdx) => (
                  <SourceCard key={sIdx} source={src} />
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Follow-up Suggestions Chips */}
          {isBot && message.suggested_followups && message.suggested_followups.length > 0 && (
            <div style={{
              marginTop: '1.15rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.73rem',
                fontWeight: 700,
                color: '#818cf8',
                marginBottom: '0.45rem',
              }}>
                <Sparkles size={12} />
                <span>Suggested Follow-up Inquiries:</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {message.suggested_followups.map((fQ, fIdx) => (
                  <button
                    key={fIdx}
                    onClick={() => sendMessage(fQ)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
                      e.currentTarget.style.borderColor = '#818cf8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    }}
                  >
                    <span>{fQ}</span>
                    <ArrowRight size={11} color="#818cf8" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bot Message Footer: Thumbs Feedback */}
          {isBot && !message.message_id?.startsWith('err_') && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.85rem',
              paddingTop: '0.6rem',
              borderTop: '1px dashed rgba(255, 255, 255, 0.05)',
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Was this information helpful?
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={!!feedback || submittingFeedback}
                  style={{
                    background: feedback === 'positive' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    border: feedback === 'positive' ? '1px solid #10b981' : '1px solid transparent',
                    color: feedback === 'positive' ? '#34d399' : 'var(--text-muted)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.4rem',
                    cursor: feedback ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.72rem',
                    transition: 'all 0.15s ease',
                  }}
                  title="Helpful"
                >
                  <ThumbsUp size={13} />
                  {feedback === 'positive' && <span>Helpful</span>}
                </button>

                <button
                  onClick={() => handleFeedback(false)}
                  disabled={!!feedback || submittingFeedback}
                  style={{
                    background: feedback === 'negative' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                    border: feedback === 'negative' ? '1px solid #ef4444' : '1px solid transparent',
                    color: feedback === 'negative' ? '#f87171' : 'var(--text-muted)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.4rem',
                    cursor: feedback ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.72rem',
                    transition: 'all 0.15s ease',
                  }}
                  title="Not helpful"
                >
                  <ThumbsDown size={13} />
                  {feedback === 'negative' && <span>Reported</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
