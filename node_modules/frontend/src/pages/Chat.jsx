import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth.jsx';
import { getChatHistoryAPI } from '../api/chat.api.js';
import { useLocation, Link } from 'react-router-dom';

function Chat() {
  const { user } = useAuth();
  const routerLocation = useLocation();
  const messagesEndRef = useRef(null);

  // Grab the partner data passed through navigation state redirects
  const { partnerId, partnerName } = routerLocation.state || {};

  const [messages, setMessages] = useState([]);
  const [typedText, setTypedText] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Establish Socket Connection and Join Chat Room Channel
  useEffect(() => {
    if (!user?._id || !partnerId) return;

    // Connect to backend websocket port instance
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Notify backend to assemble and join our distinct room channel
    newSocket.emit('join_room', { userId: user._id, counterpartId: partnerId });

    // Listen for live incoming text broadcasts
    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Load database history
    const loadLogs = async () => {
      try {
        const history = await getChatHistoryAPI(partnerId);
        setMessages(history);
      } catch (err) {
        console.error('Failed to load past chat logs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();

    // Cleanup socket channel connection on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, partnerId]);

  // 2. Auto Scroll to Bottom on New Messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Emit Real-time Message Event handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedText.trim() || !socket) return;

    const messagePayload = {
      senderId: user._id,
      receiverId: partnerId,
      text: typedText.trim(),
    };

    // Emit event directly to backend socket instance
    socket.emit('send_message', messagePayload);
    setTypedText('');
  };

  if (!partnerId) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>No active chat session selected.</h3>
        <Link to="/dashboard">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif', background: 'var(--color-background)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '15px', marginBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Chat with {partnerName} 💬</h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--color-muted)', fontSize: '14px' }}>Discuss availability, lesson objectives, or swap goals.</p>
        </div>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--color-accent)', fontWeight: 'bold' }}>← Back to Dashboard</Link>
      </div>

      {/* Message Stream Feed */}
      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '20px', background: 'var(--color-card)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Loading message archives...</p>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic', marginTop: '150px' }}>No messages yet. Send a greeting to start things off!</p>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.sender._id === user._id || m.sender === user._id;
            return (
              <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70px', minWidth: '200px', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', color: '#777', marginBottom: '3px', textAlign: isMe ? 'right' : 'left' }}>
                  {isMe ? 'You' : partnerName}
                </div>
                <div style={{ background: isMe ? 'var(--color-accent)' : '#f5f5f0', color: isMe ? 'white' : 'var(--color-text)', padding: '10px 14px', borderRadius: '12px', borderTopRightRadius: isMe ? '0px' : '12px', borderTopLeftRadius: isMe ? '12px' : '0px', fontSize: '15px', wordBreak: 'break-word' }}>
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Text Input Entry Bar */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          required
          style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '15px' }}
        />
        <button type="submit" style={{ padding: '12px 24px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;