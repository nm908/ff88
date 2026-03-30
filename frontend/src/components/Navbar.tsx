import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User } from '../types';

interface NavbarProps {
  currentUser: string;
  setCurrentUser: (user: string) => void;
}

export default function Navbar({ currentUser, setCurrentUser }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${currentUser}`);
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-gray-900 to-black border-b border-purple-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            🎰 FF88
          </div>
          <span className="text-xs bg-purple-600 px-2 py-1 rounded">GAMING</span>
        </Link>

        {/* Center Menu */}
        <div className="flex gap-6">
          <Link to="/" className="hover:text-purple-400 transition">Trang Chủ</Link>
          <Link to="/" className="hover:text-purple-400 transition">Games</Link>
          <Link to="/" className="hover:text-purple-400 transition">Xếp Hạng</Link>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg hover:shadow-lg transition"
          >
            <span>👤 {currentUser.substring(0, 10)}</span>
            <span className="text-lg">💰 {user?.points || 0}</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-purple-500 rounded-lg p-4 shadow-xl">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Username: {currentUser}</p>
                <p className="text-lg font-bold">Điểm: {user?.points || 0}</p>
                <p className="text-sm">Level: {user?.level || 1}</p>
                <p className="text-sm">Thắng: {user?.totalWins || 0}</p>
                <p className="text-sm">Thua: {user?.totalLosses || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
