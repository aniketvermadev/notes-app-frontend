import React, { useEffect, useState, useRef } from 'react';
import API from '../services/api';
import socket from '../socket';
import EmojiPicker from 'emoji-picker-react';
import { MdOutlineEmojiEmotions } from "react-icons/md";

const Chat = ({ currentUserId, otherUserId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const pickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

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

  // auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // close emoji picker on outside click or Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!showEmoji) return;
      const el = pickerRef.current;
      const btn = emojiButtonRef.current;
      if (el && !el.contains(e.target) && btn && !btn.contains(e.target)) {
        setShowEmoji(false);
      }
    };

    const onEsc = (e) => {
      if (e.key === 'Escape') setShowEmoji(false);
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [showEmoji]);

  const handleSend = () => {
    if (!message.trim()) return;

    socket.emit('send_message', {
      sender: currentUserId,
      receiver: otherUserId,
      text: message,
    });

    setMessage('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="m-0 text-lg font-semibold">Chat</h2>
      </div>

      <div className="bg-white rounded-lg shadow flex flex-col h-[60vh]" aria-live="polite">
        <div className="p-4 overflow-y-auto overscroll-contain flex flex-col gap-3 flex-1 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((msg) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMine = senderId === currentUserId;
            const senderName = isMine ? 'Me' : msg.sender?.name || 'User';
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const initials = msg.sender?.name ? msg.sender.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';

            return (
              <div key={msg._id} className={`flex items-end ${isMine ? 'justify-end' : 'justify-start'}`}>
                {!isMine && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">{initials}</div>
                  </div>
                )}

                <div className={`msg-enter max-w-[75%] px-3 py-2 rounded-2xl shadow-sm break-words ${isMine ? 'bg-indigo-600 text-white self-end' : 'bg-gray-100 text-gray-900 self-start'}`}>
                  <div className="text-sm leading-5 whitespace-pre-wrap">{msg.text}</div>
                  <div className={`${isMine ? 'text-indigo-100/90' : 'text-gray-500'} text-xs mt-1`}>{senderName}{time ? ` · ${time}` : ''}</div>
                </div>

                {isMine && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="text-xs text-gray-500">{/* optional place for avatar or status */}</div>
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-3 bg-gray-50 flex gap-2 items-end relative">
          <div className="flex items-end gap-2">
            <button
              type="button"
              aria-label="Toggle emoji picker"
              ref={emojiButtonRef}
              onClick={() => setShowEmoji((s) => !s)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <MdOutlineEmojiEmotions size={20} />
            </button>

            {showEmoji && (
              <div ref={pickerRef} className="absolute left-3 bottom-14 bg-white border rounded-md shadow-lg p-1 w-72 z-50">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    const em = emojiData.emoji;
                    const ta = textareaRef.current;
                    if (!ta) {
                      setMessage((prev) => prev + em);
                      return;
                    }

                    const start = ta.selectionStart ?? message.length;
                    const end = ta.selectionEnd ?? message.length;
                    const newMessage = message.slice(0, start) + em + message.slice(end);
                    setMessage(newMessage);

                    // restore focus and move cursor after the inserted emoji
                    requestAnimationFrame(() => {
                      ta.focus();
                      const pos = start + em.length;
                      ta.setSelectionRange(pos, pos);
                    });
                  }}
                />
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message and press Enter to send (Shift+Enter for newline)"
            rows={1}
            className="resize-none p-2 rounded-md border border-gray-200 flex-1 text-sm"
          />

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`px-4 py-2 rounded-md text-white ${message.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;