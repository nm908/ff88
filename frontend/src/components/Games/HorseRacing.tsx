import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User } from '../types';
import { motion } from 'framer-motion';

interface HorseRacingProps {
  currentUser: string;
}

interface Horse {
  id: number;
  name: string;
  emoji: string;
  position: number;
  speed: number;
  color: string;
}

export default function HorseRacing({ currentUser }: HorseRacingProps) {
  const [user, setUser] = useState<User | null>(null);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);

  useEffect(() => {
    fetchUserData();
    initializeHorses();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${currentUser}`);
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const initializeHorses = () => {
    const horseNames = ['Thunder', 'Lightning', 'Phoenix', 'Blaze', 'Storm', 'Rocket'];
    const horseEmojis = ['🐎', '🏇', '🐴', '🦄', '⚡', '🔥'];
    const colors = ['from-red-600 to-red-400', 'from-blue-600 to-blue-400', 'from-green-600 to-green-400', 'from-yellow-600 to-yellow-400', 'from-purple-600 to-purple-400', 'from-pink-600 to-pink-400'];

    setHorses(horseNames.map((name, idx) => ({
      id: idx,
      name,
      emoji: horseEmojis[idx],
      position: 0,
      speed: Math.random() * 15 + 5,
      color: colors[idx]
    })));
  };

  const startRace = async () => {
    if (!user || betAmount > user.points) {
      toast.error('Điểm không đủ!');
      return;
    }

    if (selectedHorse === null) {
      toast.error('Chọn ngựa trước!');
      return;
    }

    setIsRacing(true);
    setWinner(null);

    const raceInterval = setInterval(() => {
      setHorses(prevHorses => {
        const updated = prevHorses.map(h => ({
          ...h,
          position: h.position + (h.speed + Math.random() * 5)
        }));

        const finished = updated.find(h => h.position >= 100);
        if (finished) {
          clearInterval(raceInterval);
          setIsRacing(false);
          setWinner(finished.id);
          endRace(finished.id);
        }

        return updated;
      });
    }, 100);

    setTimeout(() => clearInterval(raceInterval), 30000);
  };

  const endRace = async (winningHorseId: number) => {
    const won = winningHorseId === selectedHorse;
    const winAmount = won ? betAmount * 2 : 0;

    try {
      await axios.post(`http://localhost:5000/api/user/${currentUser}/update-points`, {
        points: won ? winAmount : -betAmount
      });

      await axios.post('http://localhost:5000/api/game-history', {
        username: currentUser,
        gameType: 'horse',
        betAmount,
        result: won ? 'win' : 'lose',
        winAmount
      });

      if (won) {
        toast.success(`🎉 Thắng ${winAmount} điểm!`);
      } else {
        toast.error('Thua rồi! Chọn ngựa khác lần sau 😅');
      }

      fetchUserData();
    } catch (error) {
      console.error('Error ending race:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Race Track */}
      <div className="bg-gradient-to-b from-green-900 to-green-800 rounded-lg overflow-hidden shadow-2xl mb-6 p-6">
        <div className="space-y-3">
          {horses.map(horse => (
            <div key={horse.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-lg">{horse.emoji} {horse.name}</span>
                <span className="text-xs">{Math.floor(horse.position)}%</span>
              </div>
              <motion.div
                className={`h-8 bg-gradient-to-r ${horse.color} rounded flex items-center justify-end pr-2 text-lg`}
                animate={{ width: `${Math.min(horse.position, 100)}%` }}
                transition={{ type: 'tween', duration: 0.1 }}
              >
                {horse.position >= 90 && '🏁'}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Horse Selection & Betting */}
      <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6 mb-6">
        <h3 className="font-bold mb-4">🐴 Chọn Ngựa Yêu Thích</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {horses.map(horse => (
            <button
              key={horse.id}
              onClick={() => setSelectedHorse(horse.id)}
              disabled={isRacing}
              className={`p-4 rounded-lg transition border-2 ${
                selectedHorse === horse.id
                  ? 'border-yellow-400 bg-yellow-900 bg-opacity-30'
                  : 'border-gray-600 hover:border-gray-400'
              } disabled:opacity-50`}
            >
              <p className="text-2xl mb-1">{horse.emoji}</p>
              <p className="text-sm font-bold">{horse.name}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Số tiền cá cược</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
              disabled={isRacing}
              className="w-full bg-gray-700 border border-purple-500 rounded px-4 py-2 text-white disabled:opacity-50"
            />
          </div>

          <button
            onClick={startRace}
            disabled={isRacing || selectedHorse === null}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg font-bold py-3 rounded-lg transition disabled:opacity-50 text-lg"
          >
            🏇 {isRacing ? 'ĐANG ĐUA...' : 'BẮT ĐẦU ĐUA'}
          </button>
        </div>

        {winner !== null && (
          <div className="mt-4 p-4 bg-green-900 bg-opacity-30 border border-green-500 rounded text-center">
            <p className="font-bold text-green-400">
              🏆 {horses[winner].name} chiến thắng! {selectedHorse === winner ? '✓ Bạn thắng!' : '✗ Bạn thua!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
