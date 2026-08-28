import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import SuggestedQuestions from './SuggestedQuestions';
import ChatInput from './ChatInput';
import SourceModal from './SourceModal';
import { useChat } from '../../context/ChatContext';
import { Bot, Loader2, Download } from 'lucide-react';

const ChatWindow = () => {
  const { messages, loading, currentConversationId } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const exportChatAsTxt = () => {
    if (!messages.length) return;

    const lines = messages.map((msg) => {
      const role = msg.sender === 'user' ? 'You' : 'Apex AI Assistant';
      const time = new Date(msg.created_at || Date.now()).toLocaleString();
      const sources = msg.sources?.length
        ? `\n  [Sources: ${msg.sources.map((s) => `${s.document_title} p.${s.page_number}`).join(', ')}]`
        : '';
      return `[${time}] ${role}:\n${msg.content}${sources}`;
    });

    const header = `Apex College AI Chatbot – Conversation Export\nConversation ID: ${currentConversationId || 'New Chat'}\nExported: ${new Date().toLocaleString()}\n${'='.repeat(65)}\n\n`;
    const blob = new Blob([header + lines.join('\n\n' + '-'.repeat(65) + '\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex_chat_${currentConversationId || 'new'}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top bar with export button when chat is active */}
      {messages.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '0.45rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.4)',
        }}>
          <button
            onClick={exportChatAsTxt}
            className="btn btn-ghost btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
            title="Export conversation as .txt file"
          >
            <Download size={14} />
            <span>Export Chat</span>
          </button>
        </div>
      )}

      {/* Scrollable Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem 0',
      }}>
        {messages.length === 0 ? (
          <SuggestedQuestions />
        ) : (
          <div>
            {messages.map((msg, index) => (
              <MessageBubble key={msg.message_id || index} message={msg} />
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div style={{
                display: 'flex',
                gap: '1rem',
                maxWidth: '850px',
                width: '100%',
                margin: '0 auto 1.5rem',
                padding: '0 1rem',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--accent-glow)',
                }}>
                  <Bot size={20} color="#ffffff" />
                </div>
                <div style={{
                  background: 'rgba(30, 41, 59, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                }}>
                  <Loader2 size={16} style={{ animation: 'spin 1.2s linear infinite', color: '#818cf8' }} />
                  <span>Searching college document embeddings &amp; synthesizing grounded response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Bottom Input Bar */}
      <ChatInput />

      {/* Source Citation Modal */}
      <SourceModal />
    </div>
  );
};

export default ChatWindow;
