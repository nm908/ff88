import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User } from '../types';

interface FootballProps {
  currentUser: string;
}

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeEmoji: string;
  awayEmoji: string;
  result: 'home' | 'away' | 'draw' | null;
}

export default function Football({ currentUser }: FootballProps) {
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedBets, setSelectedBets] = useState<{ [key: number]: 'home' | 'away' | 'draw' }>({});
  const [betAmount, setBetAmount] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [results, setResults] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchUserData();
    initializeMatches();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${currentUser}`);
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const initializeMatches = () => {
    const teams = [
      { name: 'Manchester United', emoji: '🔴' },
      { name: 'Liverpool', emoji: '🔴' },
      { name: 'Arsenal', emoji: '🔴' },
      { name: 'Chelsea', emoji: '💙' },
      { name: 'Real Madrid', emoji: '⚪' },
      { name: 'Barcelona', emoji: '🔵' }
    ];

    const newMatches: Match[] = [];
    for (let i = 0; i < 3; i++) {
      const home = Math.floor(Math.random() * teams.length);
      let away = Math.floor(Math.random() * teams.length);
      while (away === home) away = Math.floor(Math.random() * teams.length);

      newMatches.push({
        id: i,
        homeTeam: teams[home].name,
        awayTeam: teams[away].name,
        homeEmoji: teams[home].emoji,
        awayEmoji: teams[away].emoji,
        homeScore: 0,
        awayScore: 0,
        result: null
      });
    }
    setMatches(newMatches);
  };

  const startMatches = async () => {
    if (Object.keys(selectedBets).length === 0) {
      toast.error('Chọn ít nhất 1 trận đấu!');
      return;
    }

    const totalBet = (Object.keys(selectedBets).length) * betAmount;
    if (totalBet > (user?.points || 0)) {
      toast.error('Điểm không đủ!');
      return;
    }

    setIsPlaying(true);

    // Simulate match scores
    setTimeout(() => {
      const newMatches = matches.map(match => {
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore = Math.floor(Math.random() * 4);
        let result: 'home' | 'away' | 'draw';

        if (homeScore > awayScore) result = 'home';
        else if (awayScore > homeScore) result = 'away';
        else result = 'draw';

        return { ...match, homeScore, awayScore, result };
      });

      setMatches(newMatches);
      calculateResults(newMatches);
      setIsPlaying(false);
    }, 3000);
  };

  const calculateResults = async (finalMatches: Match[]) => {
    let wins = 0;
    const newResults: { [key: number]: boolean } = {};

    Object.entries(selectedBets).forEach(([matchId, prediction]) => {
      const match = finalMatches[parseInt(matchId)];
      const won = match.result === prediction;
      newResults[parseInt(matchId)] = won;
      if (won) wins++;
    });

    setResults(newResults);

    const winAmount = wins * betAmount * 2;
    const lossAmount = (Object.keys(selectedBets).length - wins) * betAmount;

    try {
      await axios.post(`http://localhost:5000/api/user/${currentUser}/update-points`, {
        points: winAmount - lossAmount
      });

      await axios.post('http://localhost:5000/api/game-history', {
        username: currentUser,
        gameType: 'football',
        betAmount: lossAmount,
        result: wins > 0 ? 'win' : 'lose',
        winAmount
      });

      toast.success(`${wins}/${Object.keys(selectedBets).length} trận thắng! +${winAmount - lossAmount} điểm`);
      fetchUserData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleBet = (matchId: number, prediction: 'home' | 'away' | 'draw') => {
    if (isPlaying) return;

    setSelectedBets(prev => {
      if (prev[matchId] === prediction) {
        const newBets = { ...prev };
        delete newBets[matchId];
        return newBets;
      }
      return { ...prev, [matchId]: prediction };
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Matches */}
      <div className="space-y-4 mb-6">
        {matches.map(match => (
          <div key={match.id} className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6">
            <div className="mb-4">
              <div className="grid grid-cols-3 items-center gap-4 mb-4">
                {/* Home Team */}
                <div className="text-center">
                  <p className="text-3xl mb-2">{match.homeEmoji}</p>
                  <p className="font-bold">{match.homeTeam}</p>
                  <p className="text-2xl font-bold text-green-400 mt-2">{match.homeScore}</p>
                </div>

                {/* vs */}
                <div className="text-center">
                  <p className="text-gray-400">vs</p>
                  {match.result && (
                    <p className="text-sm font-bold text-yellow-400 mt-2">
                      ✓ Final
                    </p>
                  )}
                </div>

                {/* Away Team */}
                <div className="text-center">
                  <p className="text-3xl mb-2">{match.awayEmoji}</p>
                  <p className="font-bold">{match.awayTeam}</p>
                  <p className="text-2xl font-bold text-blue-400 mt-2">{match.awayScore}</p>
                </div>
              </div>

              {/* Betting Options */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => toggleBet(match.id, 'home')}
                  disabled={isPlaying || match.result !== null}
                  className={`p-3 rounded-lg transition border-2 font-bold ${
                    selectedBets[match.id] === 'home'
                      ? 'border-green-400 bg-green-900 bg-opacity-30 text-green-400'
                      : 'border-gray-600 hover:border-gray-400 text-gray-300'
                  } disabled:opacity-50`}
                >
                  🏠 Home Win
                </button>

                <button
                  onClick={() => toggleBet(match.id, 'draw')}
                  disabled={isPlaying || match.result !== null}
                  className={`p-3 rounded-lg transition border-2 font-bold ${
                    selectedBets[match.id] === 'draw'
                      ? 'border-yellow-400 bg-yellow-900 bg-opacity-30 text-yellow-400'
                      : 'border-gray-600 hover:border-gray-400 text-gray-300'
                  } disabled:opacity-50`}
                >
                  🤝 Draw
                </button>

                <button
                  onClick={() => toggleBet(match.id, 'away')}
                  disabled={isPlaying || match.result !== null}
                  className={`p-3 rounded-lg transition border-2 font-bold ${
                    selectedBets[match.id] === 'away'
                      ? 'border-blue-400 bg-blue-900 bg-opacity-30 text-blue-400'
                      : 'border-gray-600 hover:border-gray-400 text-gray-300'
                  } disabled:opacity-50`}
                >
                  ⚽ Away Win
                </button>
              </div>

              {/* Result Indicator */}
              {results[match.id] !== undefined && (
                <div className={`mt-4 p-2 rounded text-center font-bold ${
                  results[match.id]
                    ? 'bg-green-900 bg-opacity-30 text-green-400'
                    : 'bg-red-900 bg-opacity-30 text-red-400'
                }`}>
                  {results[match.id] ? '✓ Đúng dự đoán!' : '✗ Sai dự đoán!'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Betting Controls */}
      <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Số tiền cá cược / trận</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
              disabled={isPlaying}
              className="w-full bg-gray-700 border border-purple-500 rounded px-4 py-2 text-white disabled:opacity-50"
            />
          </div>

          <div className="flex justify-between text-sm">
            <span>Tổng cá cược: <span className="font-bold text-yellow-400">{Object.keys(selectedBets).length * betAmount}</span></span>
            <span>Trận chọn: <span className="font-bold text-blue-400">{Object.keys(selectedBets).length}</span></span>
          </div>

          <button
            onClick={startMatches}
            disabled={isPlaying || Object.keys(selectedBets).length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg font-bold py-3 rounded-lg transition disabled:opacity-50 text-lg"
          >
            ⚽ {isPlaying ? 'ĐANG CHƠI...' : 'CHƠI'}
          </button>
        </div>
      </div>
    </div>
  );
}
