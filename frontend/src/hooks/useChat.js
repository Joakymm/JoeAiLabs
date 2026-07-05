import { useState, useEffect, useCallback, useRef } from 'react';
import { conversationsAPI } from '../services/socialApi';
import { getSocket } from '../services/socketService';
import { useAuth } from '../context/AuthContext';

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});

  const fetchConversations = useCallback(async () => {
    try {
      const { data: res } = await conversationsAPI.getAll();
      setConversations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const openConversation = useCallback(async (participantId) => {
    try {
      const { data: res } = await conversationsAPI.createOrGet(participantId);
      setActiveConversation(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to open conversation:', err);
      return null;
    }
  }, []);

  const selectConversation = useCallback((conv) => {
    setActiveConversation(conv);
    setMessages([]);
    setHasMoreMessages(true);
    fetchMessages(conv._id);
  }, []);

  const fetchMessages = useCallback(async (convId, cursor = null) => {
    setMessagesLoading(true);
    try {
      const params = { limit: 20 };
      if (cursor) params.cursor = cursor;
      const { data: res } = await conversationsAPI.getMessages(convId || activeConversation?._id, params);
      const newMessages = res.data || [];
      setHasMoreMessages(res.hasMore);

      if (cursor) {
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);

        const socket = getSocket();
        if (socket && convId) {
          socket.emit('join-conversation', convId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [activeConversation?._id]);

  const loadMoreMessages = useCallback(() => {
    if (messages.length > 0 && hasMoreMessages) {
      const oldest = messages[0];
      fetchMessages(null, oldest.sentAt);
    }
  }, [messages, hasMoreMessages, fetchMessages]);

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || !activeConversation) return;
    try {
      const { data: res } = await conversationsAPI.sendMessage(activeConversation._id, { text });
      const newMsg = res.data;
      setMessages(prev => [...prev, newMsg]);
      setConversations(prev => prev.map(c =>
        c._id === activeConversation._id
          ? { ...c, lastMessage: { sender: user._id, text: text.substring(0, 100), sentAt: new Date() } }
          : c
      ));
      return newMsg;
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [activeConversation, user?._id]);

  const markAsRead = useCallback(async (messageId) => {
    try {
      await conversationsAPI.markRead(messageId);
    } catch {}
  }, []);

  // Keep latest refs for socket handler access
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;
  const fetchConversationsRef = useRef(fetchConversations);
  fetchConversationsRef.current = fetchConversations;

  // Socket event handlers
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = ({ message, conversationId }) => {
      setMessages(prev => activeConversation?._id === conversationId ? [...prev, message] : prev);
      setConversations(prev => {
        const exists = prev.some(c => c._id === conversationId);
        if (exists) {
          return prev.map(c =>
            c._id === conversationId
              ? { ...c, lastMessage: { sender: message.sender, text: message.text?.substring(0, 100), sentAt: new Date() } }
              : c
          );
        }
        return prev;
      });
      if (!conversationsRef.current.some(c => c._id === conversationId)) {
        fetchConversationsRef.current();
      }
    };

    const handleTypingStart = ({ userId: typingUserId, conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setTypingUsers(prev => ({ ...prev, [typingUserId]: true }));
      }
    };

    const handleTypingStop = ({ userId: typingUserId, conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setTypingUsers(prev => ({ ...prev, [typingUserId]: false }));
      }
    };

    const handleMessageRead = ({ messageId, readBy }) => {
      setMessages(prev => prev.map(m =>
        m._id === messageId ? { ...m, readBy: [...(m.readBy || []), readBy] } : m
      ));
    };

    socket.on('send-message', handleNewMessage);
    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);
    socket.on('message-read', handleMessageRead);

    return () => {
      socket.off('send-message', handleNewMessage);
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
      socket.off('message-read', handleMessageRead);
    };
  }, [activeConversation?._id]);

  return {
    conversations, loading, activeConversation,
    messages, messagesLoading, hasMoreMessages, typingUsers,
    fetchConversations, openConversation, selectConversation,
    fetchMessages, loadMoreMessages, sendMessage, markAsRead,
    setActiveConversation,
  };
}
