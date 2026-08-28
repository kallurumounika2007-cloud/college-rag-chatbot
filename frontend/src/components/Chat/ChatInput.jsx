import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, Loader2, Globe, Filter } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const DEPARTMENTS = ['All', 'Admissions', 'CSE', 'Hostel', 'Placements', 'General'];
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

const ChatInput = () => {
  const { 
    sendMessage, 
    loading, 
    selectedDepartment, 
    setSelectedDepartment,
    selectedLanguage,
    setSelectedLanguage
  } = useChat();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : (selectedLanguage === 'te' ? 'te-IN' : 'en-US');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting voice recognition:', err);
      }
    }
  };

  useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [loading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{
      maxWidth: '850px',
      width: '100%',
      margin: '0 auto',
      padding: '0 1rem 1.25rem',
      position: 'relative',
    }}>
      {/* Controls Bar: Department Filter & Language Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        marginBottom: '0.6rem',
        padding: '0 0.25rem',
        fontSize: '0.78rem',
      }}>
        {/* Department Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>
            <Filter size={12} />
            <span style={{ fontWeight: 600 }}>Filter:</span>
          </div>
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDepartment === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDepartment(dept)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid #818cf8' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Globe size={13} color="#818cf8" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              background: 'rgba(31, 41, 55, 0.8)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.2rem 0.45rem',
              fontSize: '0.75rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(16px)',
          border: isListening ? '1px solid #ef4444' : '1px solid var(--border-active)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.4rem 0.5rem 0.4rem 1.1rem',
          boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'var(--shadow-md)',
          transition: 'all 0.2s ease',
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening 
              ? '🎙️ Listening... speak your college question now...' 
              : 'Ask anything about fees, exams, hostel rules, admissions, or placements...'
          }
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-primary)',
            resize: 'none',
            maxHeight: '120px',
            lineHeight: 1.5,
            padding: '0.4rem 0',
          }}
        />

        {/* Voice Speech-to-Text Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className="btn btn-ghost btn-icon"
          style={{
            color: isListening ? '#ef4444' : 'var(--text-muted)',
            marginRight: '0.25rem',
            background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            borderRadius: '50%',
            animation: isListening ? 'pulseGlow 1s infinite' : 'none',
          }}
          title={isListening ? 'Stop voice recording' : 'Click to speak question (Voice Input)'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn btn-primary"
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            height: '42px',
          }}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              <Send size={16} />
              <span style={{ fontSize: '0.85rem' }}>Send</span>
            </>
          )}
        </button>
      </form>

      <div style={{
        textAlign: 'center',
        marginTop: '0.45rem',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
      }}>
        Hybrid RAG pipeline · Grounded in official college documents with verified sources.
      </div>
    </div>
  );
};

export default ChatInput;
