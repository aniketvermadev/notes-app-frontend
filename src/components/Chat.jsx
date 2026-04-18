import React, { useEffect, useState, useRef } from 'react';
import API from '../services/api';
import socket from '../socket';
import EmojiPicker from 'emoji-picker-react';
import { MdOutlineEmojiEmotions } from 'react-icons/md';

const Chat = ({ currentUserId, otherUserId, selectedUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const pickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // fetch old messages
  useEffect(() => {
    if (!otherUserId) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await API.get(`/chat/${otherUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages(res.data.messages || []);
      } catch (error) {
        console.log('Fetch messages error:', error);
      }
    };

    fetchMessages();
  }, [otherUserId]);

  // socket connect logs
  useEffect(() => {
    const handleConnect = () => {
      console.log('✅ Socket connected:', socket.id);
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
    };

    const handleConnectError = (err) => {
      console.log('⚠️ Socket connect error:', err.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  // join room only after socket connects
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    const joinRoom = () => {
      console.log('📥 join_chat emit:', {
        userId: currentUserId,
        otherUserId,
      });

      socket.emit('join_chat', {
        userId: currentUserId,
        otherUserId,
      });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on('connect', joinRoom);
    }

    return () => {
      socket.off('connect', joinRoom);
    };
  }, [currentUserId, otherUserId]);

  // receive new messages
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      console.log('📩 receive_message:', newMessage);

      setMessages((prev) => {
        const alreadyExists = prev.some((msg) => msg._id === newMessage._id);
        if (alreadyExists) return prev;
        return [...prev, newMessage];
      });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);

  // typing listeners
  useEffect(() => {
    const onTyping = (data) => {
      console.log('⌨️ typing:', data);

      if (data?.sender === otherUserId) {
        setIsTyping(true);
        setTypingUser(data.sender);
      }
    };

    const onStopTyping = (data) => {
      console.log('🛑 stop_typing:', data);

      if (!data || data.sender === otherUserId) {
        setIsTyping(false);
        setTypingUser(null);
      }
    };

    socket.on('typing', onTyping);
    socket.on('stop_typing', onStopTyping);

    return () => {
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStopTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [otherUserId]);

  // auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // close emoji picker on outside click or Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!showEmoji) return;

      const pickerEl = pickerRef.current;
      const buttonEl = emojiButtonRef.current;

      if (
        pickerEl &&
        !pickerEl.contains(e.target) &&
        buttonEl &&
        !buttonEl.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    };

    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setShowEmoji(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [showEmoji]);

  const emitStopTyping = () => {
    if (!currentUserId || !otherUserId) return;

    socket.emit('stop_typing', {
      sender: currentUserId,
      receiver: otherUserId,
    });
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !currentUserId || !otherUserId) return;

    console.log('📤 send_message emit:', {
      sender: currentUserId,
      receiver: otherUserId,
      text: trimmedMessage,
    });

    socket.emit('send_message', {
      sender: currentUserId,
      receiver: otherUserId,
      text: trimmedMessage,
    });

    emitStopTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setMessage('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    if (!currentUserId || !otherUserId) return;

    socket.emit('typing', {
      sender: currentUserId,
      receiver: otherUserId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 900);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="m-0 text-lg font-semibold">Chat</h2>
      </div>

      <div
        className="bg-white rounded-lg shadow flex flex-col h-[60vh]"
        aria-live="polite"
      >
        <div className="p-4 overflow-y-auto overscroll-contain flex flex-col gap-3 flex-1 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((msg) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMine = senderId === currentUserId;
            const senderName = isMine ? 'Me' : msg.sender?.name || 'User';
            const time = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            const initials = msg.sender?.name
              ? msg.sender.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'U';

            return (
              <div
                key={msg._id}
                className={`flex items-end ${
                  isMine ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isMine && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                      {initials}
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm break-words ${
                    isMine
                      ? 'bg-indigo-600 text-white self-end'
                      : 'bg-gray-100 text-gray-900 self-start'
                  }`}
                >
                  <div className="text-sm leading-5 whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  <div
                    className={`${
                      isMine ? 'text-indigo-100/90' : 'text-gray-500'
                    } text-xs mt-1`}
                  >
                    {senderName}
                    {time ? ` · ${time}` : ''}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 pb-2 min-h-[32px]">
          {isTyping && typingUser === otherUserId && (
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700">
                {selectedUser?.name
                  ? selectedUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'U'}
              </div>

              <div className="bg-gray-100 px-3 py-1 rounded-full">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:0.3s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3 bg-gray-50 flex gap-2 items-end relative">
          <div className="flex items-end gap-2">
            <button
              type="button"
              aria-label="Toggle emoji picker"
              ref={emojiButtonRef}
              onClick={() => setShowEmoji((prev) => !prev)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <MdOutlineEmojiEmotions size={20} />
            </button>

            {showEmoji && (
              <div
                ref={pickerRef}
                className="absolute left-3 bottom-14 bg-white border rounded-md shadow-lg p-1 w-72 z-50"
              >
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    const emoji = emojiData.emoji;
                    const ta = textareaRef.current;

                    if (!ta) {
                      setMessage((prev) => prev + emoji);
                      return;
                    }

                    const start = ta.selectionStart ?? message.length;
                    const end = ta.selectionEnd ?? message.length;

                    const newMessage =
                      message.slice(0, start) + emoji + message.slice(end);

                    setMessage(newMessage);

                    requestAnimationFrame(() => {
                      ta.focus();
                      const pos = start + emoji.length;
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
            onChange={handleMessageChange}
            onKeyDown={onKeyDown}
            placeholder="Type a message and press Enter to send (Shift+Enter for newline)"
            rows={1}
            className="resize-none p-2 rounded-md border border-gray-200 flex-1 text-sm"
          />

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`px-4 py-2 rounded-md text-white ${
              message.trim()
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;