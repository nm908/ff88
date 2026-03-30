import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User } from '../types';

interface CrashGameProps {
  currentUser: string;
}

export default function CrashGame({ currentUser }: CrashGameProps) {
  const [user, setUser] = useState<User | null>(null);
  const [betAmount, setBetAmount] = useState(1000);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed' | 'won'>('idle');
  const [potentialWin, setPotentialWin] = useState(0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [canCashOut, setCanCashOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

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

  // Tính toán xác suất crash dựa trên độ cao (cao hơn = khó hơn)
  const getWinProbability = (mult: number): number => {
    if (mult >= 30) return 5;      // 5% chance
    if (mult >= 15) return 15;     // 15% chance
    if (mult >= 10) return 40;     // 40% chance
    if (mult >= 6) return 60;      // 60% chance
    return 100;                     // 100% chance (chắc chắn win)
  };

  // Mỗi 0.01x tăng = betAmount / 100 điểm
  const calculateReward = (mult: number) => {
    return Math.floor(betAmount * mult);
  };

  const startGame = async () => {
    if (!user || betAmount > user.points) {
      toast.error('💔 Điểm không đủ!');
      return;
    }

    if (betAmount < 10) {
      toast.error('❌ Cược tối thiểu 10 điểm!');
      return;
    }

    // Trừ điểm cược ngay khi bắt đầu
    try {
      await axios.post(`http://localhost:5000/api/user/${currentUser}/update-points`, {
        points: -betAmount
      });
      fetchUserData();
    } catch (error) {
      toast.error('❌ Lỗi trừ điểm!');
      return;
    }

    setGameState('playing');
    setIsPlaying(true);
    setMultiplier(1.0);
    setCanCashOut(true);
    setPotentialWin(0);

    // Random crash point: 1.0 - 35.0
    const randomCrash = Math.random() * 34 + 1.0;
    setCrashPoint(randomCrash);

    let currentMult = 1.0;

    gameLoopRef.current = setInterval(() => {
      currentMult += 0.05 + Math.random() * 0.15; // Tăng 0.05-0.20 mỗi frame
      const rounded = parseFloat(currentMult.toFixed(2));

      setMultiplier(rounded);
      setPotentialWin(calculateReward(rounded));

      // Kiểm tra xác suất crash
      const winChance = getWinProbability(rounded);
      if (Math.random() * 100 > winChance) {
        // CRASH!
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        
        setGameState('crashed');
        setIsPlaying(false);
        setCanCashOut(false);
        
        toast.error(`💥 CRASH tại ${rounded.toFixed(2)}x! Mất ${betAmount} điểm!`);

        setTimeout(() => {
          setGameState('idle');
          setMultiplier(1.0);
          setPotentialWin(0);
        }, 2000);
      }
    }, 100); // Update mỗi 100ms

    setTimeout(() => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }, 60000); // Max 60 giây
  };

  const cashOut = async () => {
    if (!isPlaying || !canCashOut) return;

    setIsPlaying(false);
    setCanCashOut(false);

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);

    const winAmount = calculateReward(multiplier);

    try {
      // Cộng điểm thắng
      await axios.post(`http://localhost:5000/api/user/${currentUser}/update-points`, {
        points: winAmount
      });

      // Lưu lịch sử
      await axios.post('http://localhost:5000/api/game-history', {
        username: currentUser,
        gameType: 'crash',
        betAmount,
        result: 'win',
        winAmount,
        multiplier
      });

      setGameState('won');
      toast.success(`🎉 CASH OUT tại ${multiplier.toFixed(2)}x! +${winAmount} điểm!`);
      
      fetchUserData();

      setTimeout(() => {
        setGameState('idle');
        setMultiplier(1.0);
        setPotentialWin(0);
      }, 2000);
    } catch (error) {
      toast.error('❌ Lỗi cộng điểm!');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Game Display */}
      <div className="bg-gradient-to-br from-red-900 to-black rounded-lg overflow-hidden shadow-2xl mb-6">
        {/* Canvas for animation */}
        <canvas ref={canvasRef} className="w-full h-96 bg-gradient-to-b from-red-800 to-black" />

        {/* Multiplier Display */}
        <div className="p-8 text-center bg-gradient-to-t from-black to-red-900 to-40%">
          <div className={`text-7xl font-bold mb-4 transition-all duration-100 ${
            gameState === 'crashed' ? 'text-red-500 animate-pulse' :
            gameState === 'won' ? 'text-green-400' :
            'text-orange-400'
          }`}>
            {multiplier.toFixed(2)}x
          </div>

          {/* Potential Win */}
          {isPlaying && (
            <div className="text-2xl mb-6">
              <span className="text-green-400 font-bold">💰 {potentialWin.toLocaleString()} điểm</span>
              <p className="text-xs text-gray-300 mt-2">
                Cược: {betAmount.toLocaleString()} | Lãi: {(potentialWin - betAmount).toLocaleString()}
              </p>
            </div>
          )}

          {/* Status Messages */}
          {gameState === 'crashed' && (
            <div className="text-3xl text-red-400 font-bold animate-bounce mb-4">
              💥 CRASH!
            </div>
          )}
          {gameState === 'won' && (
            <div className="text-3xl text-green-400 font-bold animate-bounce mb-4">
              ✅ CASH OUT!
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            {gameState === 'playing' && (
              <button
                onClick={cashOut}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg font-bold py-4 px-12 rounded-lg transition text-lg transform hover:scale-105 active:scale-95"
              >
                💰 CASH OUT
              </button>
            )}

            {gameState === 'idle' && (
              <button
                onClick={startGame}
                disabled={isPlaying}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg font-bold py-4 px-12 rounded-lg transition text-lg transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                🎮 PLAY
              </button>
            )}
          </div>
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
              className="w-full bg-gray-700 border-2 border-purple-500 rounded px-4 py-3 text-white disabled:opacity-50 focus:outline-none focus:border-pink-500"
            />
            <p className="text-xs text-gray-400 mt-1">🔹 Min: 10 | Mỗi 0.01x = +{Math.floor(betAmount / 100)} điểm</p>
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

      {/* Win Probability Chart */}
      <div className="mt-6 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
        <p className="text-sm font-bold mb-4">📊 Xác suất thắng theo multiplier:</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-red-900 bg-opacity-50 p-2 rounded">
            <div className="font-bold text-red-300">x30+ 🎯</div>
            <div className="text-gray-300">5% chance</div>
          </div>
          <div className="bg-orange-900 bg-opacity-50 p-2 rounded">
            <div className="font-bold text-orange-300">x15-29.99 ⭐</div>
            <div className="text-gray-300">15% chance</div>
          </div>
          <div className="bg-yellow-900 bg-opacity-50 p-2 rounded">
            <div className="font-bold text-yellow-300">x10-14.99 💫</div>
            <div className="text-gray-300">40% chance</div>
          </div>
          <div className="bg-green-900 bg-opacity-50 p-2 rounded">
            <div className="font-bold text-green-300">x0-9.99 ✓</div>
            <div className="text-gray-300">60-100% chance</div>
          </div>
        </div>
      </div>
    </div>
  );
}
