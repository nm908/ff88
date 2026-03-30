import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User } from '../types';

interface CrashGameProps {
  currentUser: string;
}

export default function CrashGame({ currentUser }: CrashGameProps) {
  const [user, setUser] = useState<User | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed'>('idle');
  const [won, setWon] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const calculateWinChance = (mult: number): number => {
    if (mult >= 30) return 5;
    if (mult >= 15) return 15;
    if (mult >= 10) return 40;
    if (mult >= 6) return 60;
    return 100;
  };

  const startGame = async () => {
    if (!user || betAmount > user.points) {
      toast.error('Điểm không đủ!');
      return;
    }

    setGameState('playing');
    setIsPlaying(true);
    setMultiplier(1.0);
    setWon(false);

    let currentMult = 1.0;
    const crashPoint = Math.random() * 35 + 1.0; // Random crash between 1.0 and 36

    const gameInterval = setInterval(() => {
      currentMult += Math.random() * 0.3;
      setMultiplier(parseFloat(currentMult.toFixed(2)));

      if (currentMult >= crashPoint) {
        clearInterval(gameInterval);
        setGameState('crashed');
        setIsPlaying(false);
        endGame(false, currentMult);
      }
    }, 100);

    setTimeout(() => {
      if (gameInterval) clearInterval(gameInterval);
    }, 30000);
  };

  const cashOut = async () => {
    if (!isPlaying) return;

    setIsPlaying(false);
    setGameState('idle');

    const winChance = calculateWinChance(multiplier);
    const didWin = Math.random() * 100 < winChance;

    if (didWin) {
      const winAmount = Math.floor(betAmount * multiplier);
      await endGame(true, multiplier, winAmount);
    } else {
      toast.error(`Crash tại ${multiplier.toFixed(2)}x`);
      await endGame(false, multiplier);
    }
  };

  const endGame = async (won: boolean, crash: number, winAmount: number = 0) => {
    try {
      const pointsChange = won ? winAmount : -betAmount;
      
      await axios.post(`http://localhost:5000/api/user/${currentUser}/update-points`, {
        points: pointsChange
      });

      await axios.post('http://localhost:5000/api/game-history', {
        username: currentUser,
        gameType: 'crash',
        betAmount,
        result: won ? 'win' : 'lose',
        winAmount,
        multiplier: crash
      });

      setWon(won);
      if (won) {
        toast.success(`🎉 Thắng ${winAmount} điểm!`);
      }

      fetchUserData();
      setMultiplier(crash);
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Game Display */}
      <div className="bg-gradient-to-br from-red-900 to-black rounded-lg overflow-hidden shadow-2xl mb-6">
        <canvas
          ref={canvasRef}
          className="w-full h-96 bg-gradient-to-b from-red-800 to-black"
        />

        <div className="p-8 text-center">
          <div className="text-6xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
            {multiplier.toFixed(2)}x
          </div>

          <div className="flex justify-center gap-4 mb-6">
            {gameState === 'playing' && (
              <button
                onClick={cashOut}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg font-bold py-3 px-8 rounded-lg transition text-lg"
              >
                💰 CASH OUT
              </button>
            )}

            {gameState !== 'playing' && (
              <button
                onClick={startGame}
                disabled={isPlaying}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg font-bold py-3 px-8 rounded-lg transition text-lg disabled:opacity-50"
              >
                🎮 CHƠI
              </button>
            )}
          </div>

          {gameState === 'crashed' && (
            <div className="text-red-400 text-lg font-bold animate-pulse">
              💥 CRASH!
            </div>
          )}

          {won && (
            <div className="text-green-400 text-lg font-bold animate-bounce">
              ✓ THẮNG!
            </div>
          )}
        </div>
      </div>

      {/* Betting Controls */}
      <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Số tiền cá cược</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
              disabled={isPlaying}
              className="w-full bg-gray-700 border border-purple-500 rounded px-4 py-2 text-white disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[10, 50, 100, 500].map(amount => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={isPlaying}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 py-2 rounded transition"
              >
                {amount}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-sm">
            <span>Điểm hiện tại: <span className="font-bold text-green-400">{user?.points || 0}</span></span>
            <span>Thắng: <span className="font-bold text-blue-400">{user?.totalWins || 0}</span></span>
            <span>Thua: <span className="font-bold text-red-400">{user?.totalLosses || 0}</span></span>
          </div>
        </div>
      </div>

      {/* Win Probability */}
      <div className="mt-6 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
        <p className="text-sm font-bold mb-3">📊 Xác suất thắng theo multiplier:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>x30+: 5% 🏆</div>
          <div>x15-29.99: 15% 🥇</div>
          <div>x10-14.99: 40% 🥈</div>
          <div>x6-9.99: 60% 🥉</div>
          <div>x0-5.99: 100% ✓</div>
        </div>
      </div>
    </div>
  );
}
