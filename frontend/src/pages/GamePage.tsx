import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CrashGame from '../components/CrashGame';
import HorseRacing from '../components/HorseRacing';
import Football from '../components/Football';
import TaiXiu from '../components/TaiXiu';

interface GamePageProps {
  currentUser: string;
}

export default function GamePage({ currentUser }: GamePageProps) {
  const { gameType } = useParams<{ gameType: string }>();
  const navigate = useNavigate();

  const gameTitle = {
    crash: '📈 CRASH GAME',
    horse: '🐎 ĐUA NGỰA',
    football: '⚽ BÓNG ĐÁ',
    taixiu: '🎲 TÀI - XỈU'
  }[gameType as string] || 'Game';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {gameTitle}
        </h1>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition font-bold"
        >
          ← Quay lại
        </button>
      </div>

      {/* Game Component */}
      <div>
        {gameType === 'crash' && <CrashGame currentUser={currentUser} />}
        {gameType === 'horse' && <HorseRacing currentUser={currentUser} />}
        {gameType === 'football' && <Football currentUser={currentUser} />}
        {gameType === 'taixiu' && <TaiXiu currentUser={currentUser} />}
      </div>
    </div>
  );
}
