import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { motion } from 'framer-motion';

interface ChatProps {
  currentUser: string;
  onClose: () => void;
}

export default function Chat({ currentUser, onClose }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiResponses = [
    'Chào bạn! 👋',
    'Hôm nay bạn chơi thế nào?',
    'Tôi đang chơi Crash, thật là hấp dẫn!',
    'Vừa thắng 500 điểm, hehe 🎉',
    'Bạn chuẩn bị nạp điểm chưa?',
    'Tài Xỉu hay Crash bạn thích hơn?',
    'Good luck! 🍀',
    'Keep grinding! 💪',
    'Ăn may hôm nay! 🍀',
    'Chơi thêm nữa nào! 🎮'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = chatRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - 400)),
        y: Math.max(0, Math.min(newY, window.innerHeight - 500))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: currentUser,
      message: input,
      timestamp: new Date(),
      isAI: false
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // AI Response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        username: 'FF88-AI',
        message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
        isAI: true
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 500);
  };

  return (
    <div
      ref={chatRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="fixed bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500 rounded-lg shadow-2xl w-96 h-96 flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-t-lg flex justify-between items-center"
      >
        <h3 className="font-bold">💬 Chat with AI</h3>
        <button
          onClick={onClose}
          className="text-xl hover:bg-white hover:bg-opacity-20 w-6 h-6 rounded flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p>👋 Chào mừng đến chat!</p>
            <p className="text-xs mt-2">Nói gì đó với AI...</p>
          </div>
        )}
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.isAI
                  ? 'bg-purple-700 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <p className="text-xs font-bold mb-1">{msg.username}</p>
              <p className="text-sm">{msg.message}</p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-purple-500 p-3 flex gap-2 bg-gray-800">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-gray-700 border border-purple-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded font-bold text-sm transition"
        >
          📤
        </button>
      </div>
    </div>
  );
}
