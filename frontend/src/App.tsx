import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';
import Toaster from 'react-hot-toast';

function App() {
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('ff88_user');
    if (saved) {
      setCurrentUser(saved);
    } else {
      const randomUser = `Player_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ff88_user', randomUser);
      setCurrentUser(randomUser);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen text-white">
        <Navbar currentUser={currentUser} setCurrentUser={setCurrentUser} />
        <Routes>
          <Route path="/" element={<Home currentUser={currentUser} />} />
          <Route path="/game/:gameType" element={<GamePage currentUser={currentUser} />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
