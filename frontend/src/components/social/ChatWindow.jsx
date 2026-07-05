import { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { getSocket, sendTypingStart, sendTypingStop } from '../../services/socketService';

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-card);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 255, 163, 0.1);
  flex-shrink: 0;
`;

const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 255, 163, 0.15);
`;

const AvatarPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 255, 163, 0.08);
  border: 2px solid rgba(0, 255, 163, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neon-green);
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
`;

const OnlineDot = styled.span`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid var(--bg-card);
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeaderStatus = styled.div`
  font-size: 0.72rem;
  color: ${p => p.$online ? '#22c55e' : 'var(--text-dim)'};
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DateSeparator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 8px;
  &:first-child { margin-top: 0; }
`;

const DateLine = styled.div`
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
`;

const DateLabel = styled.span`
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MessageRow = styled.div`
  display: flex;
  justify-content: ${p => p.$sent ? 'flex-end' : 'flex-start'};
  margin-bottom: 2px;
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 8px 14px;
  border-radius: ${p => p.$sent ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${p => p.$sent ? 'var(--neon-green)' : 'rgba(255, 255, 255, 0.06)'};
  color: ${p => p.$sent ? '#000' : 'var(--text-main)'};
  font-size: 0.85rem;
  line-height: 1.45;
  word-break: break-word;
  position: relative;
`;

const MessageTime = styled.div`
  font-size: 0.6rem;
  color: ${p => p.$sent ? 'rgba(0,0,0,0.5)' : 'var(--text-dim)'};
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
`;

const ReadCheck = styled.span`
  font-size: 0.65rem;
  color: ${p => p.$read ? '#4ade80' : 'var(--text-dim)'};
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 0.78rem;
  color: var(--text-muted);
  flex-shrink: 0;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 3px;
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-dim);
  animation: ${dotBounce} 1.4s ease-in-out infinite;
  animation-delay: ${p => p.$delay || 0}s;
`;

const InputArea = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 255, 163, 0.1);
  flex-shrink: 0;
`;

const Input = styled.textarea`
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 163, 0.12);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-main);
  font-size: 0.85rem;
  font-family: inherit;
  resize: none;
  outline: none;
  min-height: 40px;
  max-height: 120px;
  box-sizing: border-box;
  &::placeholder { color: var(--text-dim); }
  &:focus { border-color: var(--neon-green); }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--neon-green);
  color: #000;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.35; cursor: default; }
`;

const EmptyChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-dim);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  font-size: 0.95rem;
  margin: 0;
  color: var(--text-muted);
`;

const EmptySub = styled.p`
  font-size: 0.8rem;
  margin: 4px 0 0;
  color: var(--text-dim);
`;

const ScrollAnchor = styled.div``;

function formatMessageDate(date) {
  const msgDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (msgDate.toDateString() === today.toDateString()) return 'Today';
  if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return msgDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
}

function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;

  for (const msg of messages) {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ type: 'date', date: msg.createdAt });
    }
    groups.push({ type: 'message', message: msg });
  }

  return groups;
}

export default function ChatWindow({
  conversation,
  messages = [],
  onSendMessage,
  onLoadMore,
  hasMoreMessages = false,
  loading = false,
  typingUsers = {},
}) {
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useSocial();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherUser = conversation?.participants?.find(p => p._id !== currentUser?._id) || conversation?.participants?.[0];
  const online = otherUser ? isUserOnline(otherUser._id) : false;
  const isTyping = otherUser && typingUsers[otherUser._id];

  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const area = messagesAreaRef.current;
    if (!area) return;

    function handleScroll() {
      if (area.scrollTop === 0 && hasMoreMessages && !loading) {
        onLoadMore();
      }
    }

    area.addEventListener('scroll', handleScroll);
    return () => area.removeEventListener('scroll', handleScroll);
  }, [hasMoreMessages, loading, onLoadMore]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !onSendMessage) return;
    onSendMessage(trimmed);
    setText('');
    if (conversation?._id) {
      sendTypingStop(conversation._id);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextChange(e) {
    setText(e.target.value);

    if (!conversation?._id) return;
    sendTypingStart(conversation._id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(conversation._id);
    }, 2000);
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (conversation?._id) sendTypingStop(conversation._id);
    };
  }, [conversation?._id]);

  if (!conversation) {
    return (
      <Wrapper>
        <EmptyChat>
          <EmptyIcon><i className="fas fa-comment-dots" /></EmptyIcon>
          <EmptyText>Select a conversation</EmptyText>
          <EmptySub>Choose a chat from the sidebar to start messaging</EmptySub>
        </EmptyChat>
      </Wrapper>
    );
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <Wrapper>
      <Header>
        <AvatarWrap>
          {otherUser?.avatar ? (
            <Avatar src={otherUser.avatar} alt={otherUser.username} />
          ) : (
            <AvatarPlaceholder>
              {(otherUser?.username || '?').charAt(0).toUpperCase()}
            </AvatarPlaceholder>
          )}
          {online && <OnlineDot />}
        </AvatarWrap>
        <HeaderInfo>
          <HeaderName>{otherUser?.username || 'Unknown'}</HeaderName>
          <HeaderStatus $online={online}>
            {online ? 'Online' : 'Offline'}
          </HeaderStatus>
        </HeaderInfo>
      </Header>

      <MessagesArea ref={messagesAreaRef}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 8, color: 'var(--text-dim)', fontSize: '0.78rem' }}>
            Loading older messages...
          </div>
        )}
        {grouped.map((item, i) => {
          if (item.type === 'date') {
            return (
              <DateSeparator key={`date-${i}`}>
                <DateLine />
                <DateLabel>{formatMessageDate(item.date)}</DateLabel>
                <DateLine />
              </DateSeparator>
            );
          }
          const msg = item.message;
          const sent = msg.sender === currentUser?._id || msg.sender?._id === currentUser?._id;
          return (
            <MessageRow key={msg._id || i} $sent={sent}>
              <MessageBubble $sent={sent}>
                <div>{msg.text || (msg.image ? '📷 Image' : msg.file ? '📎 File' : '')}</div>
                <MessageTime $sent={sent}>
                  {formatMessageTime(msg.createdAt)}
                  {sent && (
                    <ReadCheck $read={msg.readBy && msg.readBy.length > 1}>
                      <i className={`fas fa-check${msg.readBy && msg.readBy.length > 1 ? '-double' : ''}`} />
                    </ReadCheck>
                  )}
                </MessageTime>
              </MessageBubble>
            </MessageRow>
          );
        })}
        <ScrollAnchor ref={messagesEndRef} />
      </MessagesArea>

      {isTyping && (
        <TypingIndicator>
          <TypingDots>
            <Dot $delay={0} />
            <Dot $delay={0.2} />
            <Dot $delay={0.4} />
          </TypingDots>
          <span>{otherUser?.username || 'User'} is typing...</span>
        </TypingIndicator>
      )}

      <InputArea>
        <Input
          placeholder="Type a message..."
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <SendButton onClick={handleSend} disabled={!text.trim()}>
          <i className="fas fa-paper-plane" />
        </SendButton>
      </InputArea>
    </Wrapper>
  );
}
