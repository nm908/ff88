import React, { useState, useEffect } from 'react';
import { aiPlayers } from '../data/aiPlayers';
import { motion } from 'framer-motion';

export default function AIPlayers() {
  const [displayPlayers, setDisplayPlayers] = useState(aiPlayers.slice(0, 12));
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      setDisplayPlayers(prev => {
        const current = aiPlayers.indexOf(prev[0]);
        const next = (current + 1) % (aiPlayers.length - 11);
        return aiPlayers.slice(next, next + 12);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [autoScroll]);

  const getPersonalityColor = (personality: string) => {
    switch(personality) {
      case 'aggressive': return 'from-red-600 to-red-400';
      case 'conservative': return 'from-blue-600 to-blue-400';
      case 'balanced': return 'from-purple-600 to-purple-400';
      case 'lucky': return 'from-yellow-600 to-yellow-400';
      default: return 'from-gray-600 to-gray-400';
    }
  };

  const getPersonalityLabel = (personality: string) => {
    switch(personality) {
      case 'aggressive': return '🔥 Tấn công';
      case 'conservative': return '🛡️ Bảo thủ';
      case 'balanced': return '⚖️ Cân bằng';
      case 'lucky': return '🍀 May mắn';
      default: return personality;
    }
  };

  return (
    <div className="w-full">
      {/* Player Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {displayPlayers.map((player, idx) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-gradient-to-br ${getPersonalityColor(player.personality)} p-4 rounded-lg border-2 border-gray-600 hover:border-yellow-400 transition cursor-pointer hover:shadow-lg`}
          >
            <div className="text-center">
              <p className="text-3xl mb-2">{player.avatar}</p>
              <p className="font-bold text-sm truncate">{player.name}</p>
              <p className="text-xs text-gray-200 mt-1">{getPersonalityLabel(player.personality)}</p>
              
              <div className="mt-3 space-y-1 text-xs">
                <div className="bg-black bg-opacity-30 px-2 py-1 rounded">
                  <p className="text-yellow-300">⭐ Lv.{player.level}</p>
                </div>
                <div className="bg-black bg-opacity-30 px-2 py-1 rounded">
                  <p className="text-green-300">💰 {player.points.toLocaleString()}</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 mt-2">
                {player.status === 'playing' ? '🎮 Đang chơi' : 
                 player.status === 'waiting' ? '⏳ Chờ...' : 
                 '😴 Rảnh'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`px-6 py-2 rounded-lg font-bold transition ${
            autoScroll
              ? 'bg-gradient-to-r from-green-600 to-emerald-600'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          {autoScroll ? '⏸️ Dừng' : '▶️ Tiếp tục'}
        </button>
      </div>

      {/* Total AI Count */}
      <div className="text-center mt-6 text-gray-400 text-sm">
        Xem {displayPlayers.length}/{aiPlayers.length} AI Players
      </div>
    </div>
  );
}
