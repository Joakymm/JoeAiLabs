import { useState, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import ChatList from '../../components/social/ChatList';
import ChatWindow from '../../components/social/ChatWindow';

export default function MessagesPage() {
  const { user } = useAuth();
  const {
    conversations, loading, activeConversation,
    messages, messagesLoading, hasMoreMessages, typingUsers,
    selectConversation, loadMoreMessages, sendMessage, markAsRead,
  } = useChat();
  const [showMobileList, setShowMobileList] = useState(true);

  const handleSelectConversation = useCallback((conv) => {
    selectConversation(conv);
    setShowMobileList(false);
  }, [selectConversation]);

  const handleBack = useCallback(() => {
    setShowMobileList(true);
  }, []);

  return (
    <div className="messages-layout">
      <div className={`messages-list-panel${!showMobileList ? ' hidden' : ''}`}>
        <ChatList
          conversations={conversations}
          activeId={activeConversation?._id}
          onSelect={handleSelectConversation}
          loading={loading}
        />
      </div>

      <div className={`messages-chat-panel${showMobileList ? ' hidden' : ''}`}>
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            onSendMessage={sendMessage}
            onLoadMore={loadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            loading={messagesLoading}
            typingUsers={typingUsers}
            onBack={handleBack}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <i className="fas fa-comments" style={{ fontSize: 56, marginBottom: 16, color: 'var(--text-dim)' }} />
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.1rem', marginBottom: 8, color: 'var(--text-main)' }}>Your Messages</h3>
            <p style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: 300 }}>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
