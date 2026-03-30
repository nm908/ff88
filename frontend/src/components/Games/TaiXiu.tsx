import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User } from '../types';
import { motion } from 'framer-motion';

interface TaiXiuProps {
  currentUser: string;
}

export default function TaiXiu({ currentUser }: TaiXiuProps) {
  const [user, setUser] = useState<User | null>(null);
  const [betAmount, setBetAmount] = useState(1000);
  const [selectedBet, setSelectedBet] = useState<'tai' | 'xiu' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dice, setDice] = useState([0, 0, 0]);
  const [result, setResult] = useState<'tai' | 'xiu' | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [totalSum, setTotalSum] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${currentUser}`);
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const startGame = async () => {
    if (!user || betAmount > user.points) {
      toast.error('💔 Điểm không đủ!');
      return;
    }

    if (!selectedBet) {
      toast.error('❌ Chọn Tài hoặc Xỉu!');
      return;
    }

    if (betAmount < 10) {
      toast.error('❌ Cược tối thiểu 10 điểm!');
      return;
    }

    // Trừ điểm cược
    try {
      await axios.post(`http://localhost:5000/api/user/${currentUser}/update-points`, {
        points: -betAmount
      });
    } catch {
      toast.error('❌ Lỗi trừ điểm!');
      return;
    }

    setIsPlaying(true);
    setWon(null);
    setResult(null);

    // Animate dice roll
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      rollCount++;

      if (rollCount >= 10) {
        clearInterval(rollInterval);
        endGame();
      }
    }, 100);
  };

  const endGame = async () => {
    const [d1, d2, d3] = dice;
    const sum = d1 + d2 + d3;
    setTotalSum(sum);

    // Tài: 11-18, Xỉu: 3-10
    const gameResult = sum >= 11 ? 'tai' : 'xiu';
    const playerWon = gameResult === selectedBet;

    setResult(gameResult);
    setWon(playerWon);
    setIsPlaying(false);

    const winAmount = playerWon ? betAmount * 2 : 0;

    try {
      if (playerWon) {
        await axios.post(`http://localhost:5000/api/user/${currentUser}/update-points`, {
          points: winAmount
        });
        toast.success(`🎉 ${selectedBet?.toUpperCase()} THẮNG! +${winAmount} điểm!`);
      } else {
        toast.error(`❌ ${gameResult?.toUpperCase()} - Bạn thua! Mất ${betAmount} điểm!`);
      }

      await axios.post('http://localhost:5000/api/game-history', {
        username: currentUser,
        gameType: 'taixiu',
        betAmount,
        result: playerWon ? 'win' : 'lose',
        winAmount,
        multiplier: 2
      });

      fetchUserData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Game Area */}
      <div className="bg-gradient-to-br from-purple-900 via-gray-900 to-black rounded-lg overflow-hidden shadow-2xl mb-6">
        <div className="p-12 text-center">
          {/* Dice Display */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-8 text-purple-300">🎲 TÀI - XỈU</h2>
            
            <div className="flex justify-center gap-6 mb-8">
              {dice.map((d, idx) => (
                <motion.div
                  key={idx}
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.3, repeat: isPlaying ? Infinity : 0 }}
                  className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg flex items-center justify-center"
                >
                  <span className="text-5xl font-bold text-white">{d}</span>
                </motion.div>
              ))}
            </div>

            {/* Sum Display */}
            {totalSum > 0 && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Tổng cộng:</p>
                <div className={`text-6xl font-bold ${
                  totalSum >= 11 
                    ? 'text-red-400' 
                    : 'text-blue-400'
                }`}>
                  {totalSum}
                </div>
                <p className="text-lg font-bold mt-2">
                  {totalSum >= 11 ? '🔴 TÀI (11-18)' : '🔵 XỈU (3-10)'}
                </p>
              </div>
            )}
          </div>

          {/* Result Message */}
          {won !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`p-4 rounded-lg mb-6 ${
                won
                  ? 'bg-green-900 bg-opacity-50 border-2 border-green-500'
                  : 'bg-red-900 bg-opacity-50 border-2 border-red-500'
              }`}
            >
              <p className={`text-2xl font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
                {won ? '✅ BẠN THẮNG!' : '❌ BẠN THUA!'}
              </p>
            </motion.div>
          )}

          {/* Betting Buttons */}
          <div className="flex gap-6 justify-center mb-6">
            <button
              onClick={() => setSelectedBet('tai')}
              disabled={isPlaying || won !== null}
              className={`py-4 px-12 rounded-lg font-bold text-lg transition transform ${
                selectedBet === 'tai'
                  ? 'bg-red-600 text-white scale-110 shadow-lg'
                  : 'bg-red-900 bg-opacity-50 text-red-300 hover:bg-red-800'
              } disabled:opacity-50`}
            >
              🔴 TÀI (11-18)
            </button>

            <button
              onClick={() => setSelectedBet('xiu')}
              disabled={isPlaying || won !== null}
              className={`py-4 px-12 rounded-lg font-bold text-lg transition transform ${
                selectedBet === 'xiu'
                  ? 'bg-blue-600 text-white scale-110 shadow-lg'
                  : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-blue-800'
              } disabled:opacity-50`}
            >
              🔵 XỈU (3-10)
            </button>
          </div>

          {/* Play Button */}
          <button
            onClick={startGame}
            disabled={isPlaying || !selectedBet}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg font-bold py-4 px-12 rounded-lg transition text-lg transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isPlaying ? '🎲 ROLLING...' : '🎮 PLAY'}
          </button>
        </div>
      </div>

      {/* Betting Controls */}
      <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">💵 Cược</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Số tiền cá cược</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))}
              disabled={isPlaying}
              className="w-full bg-gray-700 border-2 border-purple-500 rounded px-4 py-3 text-white disabled:opacity-50 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">🔹 Min: 10 | Thắng: x2</p>
          </div>

          {/* Quick Bet Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map(amount => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={isPlaying}
                className="bg-gray-600 hover:bg-purple-600 disabled:opacity-50 py-2 rounded transition font-bold text-sm"
              >
                {amount}
              </button>
            ))}
          </div>

          {/* User Stats */}
          <div className="flex justify-between text-sm bg-gray-700 bg-opacity-50 p-3 rounded">
            <span>💰 Điểm: <span className="font-bold text-green-400">{user?.points?.toLocaleString() || 0}</span></span>
            <span>🏆 Thắng: <span className="font-bold text-blue-400">{user?.totalWins || 0}</span></span>
            <span>💔 Thua: <span className="font-bold text-red-400">{user?.totalLosses || 0}</span></span>
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="mt-6 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
        <p className="text-sm font-bold mb-3">📋 Luật chơi:</p>
        <ul className="text-xs space-y-2 text-gray-300">
          <li>✓ Tài: Tổng 3 xúc xắc = 11-18</li>
          <li>✓ Xỉu: Tổng 3 xúc xắc = 3-10</li>
          <li>✓ Thắng: Lãi bằng số tiền cược</li>
          <li>✓ Thua: Mất hết số tiền cược</li>
        </ul>
      </div>
    </div>
  );
}
