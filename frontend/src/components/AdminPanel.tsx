import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [codeCount, setCodeCount] = useState(10);
  const [pointsPerCode, setPointsPerCode] = useState(1000);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const authenticate = () => {
    if (password === '1234567890') {
      setIsAuthenticated(true);
      toast.success('✓ Admin authenticated!');
      setPassword('');
    } else {
      toast.error('❌ Wrong password!');
      setPassword('');
    }
  };

  const generateCodes = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/admin/create-code', {
        codeCount,
        pointsPerCode
      }, {
        headers: { 'admin-password': '1234567890' }
      });

      setGeneratedCodes(res.data.codes.map((c: any) => c.code));
      toast.success(`✓ Generated ${codeCount} codes!`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error generating codes');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isAuthenticated) {
    return (
      <div
        ref={panelRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="fixed bg-gray-800 border-2 border-red-500 rounded-lg shadow-2xl w-80 p-6"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div
          onMouseDown={handleMouseDown}
          className="bg-gradient-to-r from-red-600 to-pink-600 p-3 rounded-lg mb-4 text-white font-bold text-center"
        >
          🔒 Admin Panel
        </div>

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && authenticate()}
          placeholder="Nhập mật khẩu admin..."
          className="w-full bg-gray-700 border-2 border-red-500 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none mb-4"
        />

        <button
          onClick={authenticate}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-lg font-bold py-2 rounded transition"
        >
          Xác nhận
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="fixed bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-500 rounded-lg shadow-2xl w-96"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        maxHeight: '90vh',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-t-lg text-white font-bold text-center sticky top-0"
      >
        ⚙️ Admin Panel
      </div>

      <div className="p-6 space-y-6">
        {/* Generate Codes */}
        <div>
          <h3 className="font-bold mb-3 text-green-400">🎁 Tạo Code Nạp Điểm</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Số lượng code:</label>
              <input
                type="number"
                value={codeCount}
                onChange={e => setCodeCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-700 border border-green-500 rounded px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Điểm mỗi code:</label>
              <input
                type="number"
                value={pointsPerCode}
                onChange={e => setPointsPerCode(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-700 border border-green-500 rounded px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <button
              onClick={generateCodes}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg font-bold py-2 rounded transition"
            >
              ✓ Tạo Code
            </button>
          </div>
        </div>

        {/* Generated Codes */}
        {generatedCodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="font-bold mb-3 text-blue-400">📋 Code Đã Tạo</h3>
            <div className="bg-gray-700 bg-opacity-50 rounded p-3 max-h-64 overflow-y-auto space-y-2">
              {generatedCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="bg-gray-600 p-2 rounded flex justify-between items-center text-sm"
                >
                  <span className="font-mono">{code}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code);
                      toast.success('✓ Copied!');
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const allCodes = generatedCodes.join('\n');
                navigator.clipboard.writeText(allCodes);
                toast.success('✓ Tất cả code copied!');
              }}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 font-bold py-2 rounded transition text-sm"
            >
              📋 Copy Tất Cả
            </button>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="font-bold mb-3 text-yellow-400">⚡ Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded transition text-sm font-bold">
              📊 Xem Stats
            </button>
            <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded transition text-sm font-bold">
              👥 Manage Users
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setGeneratedCodes([]);
              }}
              className="w-full bg-red-600 hover:bg-red-700 py-2 rounded transition text-sm font-bold"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
