import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const res = await chatAPI.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [user, fetchConversations]);

  const loadConversation = async (conversationId) => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const res = await chatAPI.getConversationDetail(conversationId);
      setCurrentConversationId(conversationId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const sendMessage = async (queryText) => {
    if (!queryText.trim() || loading) return;

    const userMessageId = `temp_${Date.now()}`;
    const optimisticUserMessage = {
      message_id: userMessageId,
      conversation_id: currentConversationId,
      sender: 'user',
      content: queryText,
      sources: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setLoading(true);

    try {
      const res = await chatAPI.ask(
        queryText, 
        currentConversationId,
        selectedDepartment,
        selectedLanguage
      );
      const { conversation_id, message_id, answer, sources, confidence, suggested_followups } = res.data;

      // Update current conversation ID if it was newly created
      if (!currentConversationId) {
        setCurrentConversationId(conversation_id);
      }

      const botMessage = {
        message_id,
        conversation_id,
        sender: 'assistant',
        content: answer,
        sources: sources || [],
        confidence: confidence || 'High',
        suggested_followups: suggested_followups || [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
      fetchConversations();
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        message_id: `err_${Date.now()}`,
        conversation_id: currentConversationId,
        sender: 'assistant',
        content: '⚠️ An error occurred while communicating with the college knowledge base. Please try again.',
        sources: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const removeConversation = async (conversationId) => {
    try {
      await chatAPI.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.conversation_id !== conversationId));
      if (currentConversationId === conversationId) {
        startNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const submitFeedback = async (messageId, isPositive, comment = '') => {
    try {
      await chatAPI.sendFeedback(messageId, isPositive, comment);
      return true;
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      return false;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        messages,
        loading,
        loadingConversations,
        selectedSource,
        setSelectedSource,
        sendMessage,
        loadConversation,
        startNewChat,
        removeConversation,
        submitFeedback,
        fetchConversations,
        selectedDepartment,
        setSelectedDepartment,
        selectedLanguage,
        setSelectedLanguage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
