import React, { useEffect, useState } from 'react';
import API from '../services/api';
import socket from '../socket';

const Chat = ({ currentUserId, otherUserId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await API.get(`/chat/${otherUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages(res.data.messages);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();
  }, [otherUserId]);

  useEffect(() => {
    socket.emit('join_chat', {
      userId: currentUserId,
      otherUserId,
    });

    socket.on('receive_message', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [currentUserId, otherUserId]);

  const handleSend = () => {
    if (!message.trim()) return;    

    socket.emit('send_message', {
      sender: currentUserId,
      receiver: otherUserId,
      text: message,
    });

    setMessage('');
  };

  return (
    <div>
      <h2>Chat</h2>

      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'auto' }}>
        {messages.map((msg) => (
          <p key={msg._id}>
            <strong>
                {console.log("msg",msg, currentUserId)}
              {(msg.sender?._id || msg.sender) === currentUserId ? 'Me' : msg.sender?.name || 'User'}:
            </strong>{' '}
            {msg.text}
          </p>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default Chat;