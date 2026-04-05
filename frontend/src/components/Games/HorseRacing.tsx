diff --git a/frontend/src/components/Games/HorseRacing.tsx b/frontend/src/components/Games/HorseRacing.tsx
index cf7e5853d9db068482297991d9e6945b168f8c80..592c89ec29acd4b406ca45368dd97e1dd4b50a03 100644
--- a/frontend/src/components/Games/HorseRacing.tsx
+++ b/frontend/src/components/Games/HorseRacing.tsx
@@ -1,29 +1,29 @@
 import React, { useState, useEffect } from 'react';
 import axios from 'axios';
 import toast from 'react-hot-toast';
-import { User } from '../types';
+import { User } from '../../types';
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
