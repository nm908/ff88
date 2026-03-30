import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Chat from '../components/Chat';
import CodeInput from '../components/CodeInput';
import AIPlayers from '../components/AIPlayers';
import { motion } from 'framer-motion';

interface HomeProps {
  currentUser: string;
}

export default function Home({ currentUser }: HomeProps) {
  const [showChat, setShowChat] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  const games = [
    {
      id: 'crash',
      title: 'CRASH',
      description: 'Chơi Crash - Đạt được multiplier cao nhất!',
      icon: '📈',
      color: 'from-red-600 to-orange-600',
      image: 'url("data:image/svg+xml,%3Csvg...'
    },
    {
      id: 'horse',
      title: 'ĐUA NGỰA',
      description: 'Cá cược vào con ngựa may mắn',
      icon: '🐎',
      color: 'from-amber-600 to-yellow-600',
      image: ''
    },
    {
      id: 'football',
      title: 'BÓNG ĐÁ',
      description: 'Dự đoán tỉ số bóng đá',
      icon: '⚽',
      color: 'from-green-600 to-emerald-600',
      image: ''
    },
    {
      id: 'taixiu',
      title: 'TÀI XỈU',
      description: 'Chọn Tài hoặc Xỉu để thắng',
      icon: '🎲',
      color: 'from-blue-600 to-cyan-600',
      image: ''
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
          Chào Mừng Đến FF88
        </h1>
        <p className="text-gray-300 text-lg">Nền tảng chơi game mô phỏng với điểm ảo - Vui vẻ và thử vận may!</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <button
          onClick={() => setShowCodeInput(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition p-4 rounded-lg text-center"
        >
          <p className="text-2xl mb-2">🎁</p>
          <p className="font-bold">Nhập Code</p>
          <p className="text-xs text-gray-200">Nhận điểm miễn phí</p>
        </button>

        <button
          onClick={() => setShowChat(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg transition p-4 rounded-lg text-center"
        >
          <p className="text-2xl mb-2">💬</p>
          <p className="font-bold">Chat</p>
          <p className="text-xs text-gray-200">Nói chuyện với AI</p>
        </button>

        <Link
          to="/admin"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg transition p-4 rounded-lg text-center block"
        >
          <p className="text-2xl mb-2">⚙️</p>
          <p className="font-bold">Admin</p>
          <p className="text-xs text-gray-200">Quản lý game</p>
        </Link>

        <button
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-lg transition p-4 rounded-lg text-center"
        >
          <p className="text-2xl mb-2">📊</p>
          <p className="font-bold">Xếp Hạng</p>
          <p className="text-xs text-gray-200">Top 50 players</p>
        </button>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {games.map((game, idx) => (
          <motion.div
            key={game.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={`/game/${game.id}`}
              className={`bg-gradient-to-br ${game.color} p-6 rounded-lg shadow-lg hover:shadow-2xl transition h-full flex flex-col justify-between cursor-pointer relative overflow-hidden group`}
            >
              <div className="absolute inset-0 opacity-10 bg-pattern"></div>
              <div className="relative z-10">
                <p className="text-5xl mb-3">{game.icon}</p>
                <h3 className="text-2xl font-bold mb-2">{game.title}</h3>
                <p className="text-sm text-gray-100">{game.description}</p>
              </div>
              <div className="relative z-10 mt-4 opacity-0 group-hover:opacity-100 transition">
                <button className="w-full bg-black bg-opacity-50 py-2 rounded font-bold">
                  CHƠI NGAY →
                </button>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* AI Players Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">👥 100 AI Players Đang Chơi</h2>
        <AIPlayers />
      </div>

      {/* Chat Modal */}
      {showChat && <Chat currentUser={currentUser} onClose={() => setShowChat(false)} />}

      {/* Code Input Modal */}
      {showCodeInput && <CodeInput currentUser={currentUser} onClose={() => setShowCodeInput(false)} />}
    </div>
  );
}
