import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CodeInputProps {
  currentUser: string;
  onClose: () => void;
}

export default function CodeInput({ currentUser, onClose }: CodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUseCode = async () => {
    if (!code.trim()) {
      toast.error('Nhập code trước!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/code/use', {
        code: code.trim(),
        username: currentUser
      });

      toast.success(res.data.message);
      setCode('');
      setTimeout(() => onClose(), 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Code không hợp lệ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500 rounded-lg p-8 w-96 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎁 Nhập Code
        </h2>

        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Nhập code của bạn..."
          className="w-full bg-gray-700 border-2 border-purple-500 rounded px-4 py-3 mb-4 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
        />

        <div className="flex gap-3">
          <button
            onClick={handleUseCode}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg disabled:opacity-50 font-bold py-3 rounded transition"
          >
            {loading ? '⏳ Đang xử lý...' : '✓ Sử dụng'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:shadow-lg font-bold py-3 rounded transition"
          >
            ✕ Đóng
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          📝 Lấy code từ các sự kiện hoặc từ admin
        </p>
      </div>
    </div>
  );
}
