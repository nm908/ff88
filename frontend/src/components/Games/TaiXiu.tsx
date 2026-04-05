diff --git a/frontend/src/components/Games/TaiXiu.tsx b/frontend/src/components/Games/TaiXiu.tsx
index aa0c842c42b046078f05fa872b207c59498cd8c9..2cb26a18d0f80232432a829d8c6b42004bcb8479 100644
--- a/frontend/src/components/Games/TaiXiu.tsx
+++ b/frontend/src/components/Games/TaiXiu.tsx
@@ -1,29 +1,29 @@
 import React, { useState, useEffect } from 'react';
 import axios from 'axios';
 import toast from 'react-hot-toast';
-import { User } from '../types';
+import { User } from '../../types';
 import { motion } from 'framer-motion';
 
 interface TaiXiuProps {
   currentUser: string;
 }
 
 export default function TaiXiu({ currentUser }: TaiXiuProps) {
   const [user, setUser] = useState<User | null>(null);
   const [betAmount, setBetAmount] = useState(1000);
   const [selectedBet, setSelectedBet] = useState<'tai' | 'xiu' | null>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [dice, setDice] = useState([0, 0, 0]);
   const [result, setResult] = useState<'tai' | 'xiu' | null>(null);
   const [won, setWon] = useState<boolean | null>(null);
   const [totalSum, setTotalSum] = useState(0);
 
   useEffect(() => {
     fetchUserData();
   }, []);
 
   const fetchUserData = async () => {
     try {
       const res = await axios.get(`http://localhost:5000/api/user/${currentUser}`);
       setUser(res.data);
     } catch (error) {
