diff --git a/frontend/src/components/Games/Football.tsx b/frontend/src/components/Games/Football.tsx
index a498f16cd4a7ddbf7ad1b6f707b03fc82196eec0..655175436aeae743ae21d6a2b258339a0d00854b 100644
--- a/frontend/src/components/Games/Football.tsx
+++ b/frontend/src/components/Games/Football.tsx
@@ -1,29 +1,29 @@
 import React, { useState, useEffect } from 'react';
 import axios from 'axios';
 import toast from 'react-hot-toast';
-import { User } from '../types';
+import { User } from '../../types';
 
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
