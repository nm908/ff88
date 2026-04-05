diff --git a/frontend/src/components/Games/CrashGame.tsx b/frontend/src/components/Games/CrashGame.tsx
index 64e6416347085be86897b15466db4a6f47162064..8b088477252e845d4f3da689c67af6a6d2a2817b 100644
--- a/frontend/src/components/Games/CrashGame.tsx
+++ b/frontend/src/components/Games/CrashGame.tsx
@@ -1,29 +1,29 @@
 import React, { useState, useEffect, useRef } from 'react';
 import axios from 'axios';
 import toast from 'react-hot-toast';
-import { User } from '../types';
+import { User } from '../../types';
 
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
