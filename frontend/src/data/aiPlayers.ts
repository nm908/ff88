import { AIPlayer } from '../types';
import { v4 as uuidv4 } from 'uuid';

const avatarUrls = [
  '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍🔧', '👩‍🔧',
  '👨‍🌾', '👩‍🌾', '👨‍⚕️', '👩‍⚕️', '👨‍🎨', '👩‍🎨',
  '👨‍💻', '👩‍💻', '🧑‍🚀', '👨‍🍳', '👩‍🍳', '🧑‍⚖️'
];

const names = [
  'Dragon', 'Phoenix', 'Tiger', 'Lion', 'Wolf', 'Eagle',
  'Shark', 'Cobra', 'Falcon', 'Puma', 'Viper', 'Ninja',
  'Samurai', 'Knight', 'Warrior', 'Hunter', 'Ranger', 'Scout',
  'Ace', 'Legend', 'Boss', 'King', 'Star', 'Pro',
  'Master', 'Expert', 'Champion', 'Victor', 'Winner', 'Champ',
  'Nova', 'Blaze', 'Storm', 'Thunder', 'Lightning', 'Flash',
  'Shadow', 'Ghost', 'Phantom', 'Specter', 'Wraith', 'Spirit',
  'Mystic', 'Wizard', 'Sage', 'Oracle', 'Prophet', 'Seer',
  'Titan', 'Giant', 'Colossus', 'Behemoth', 'Leviathan', 'Goliath',
  'Rogue', 'Thief', 'Outlaw', 'Bandit', 'Pirate', 'Raider',
  'Lucky', 'Fortune', 'Destiny', 'Fate', 'Chaos', 'Pandora',
  'Matrix', 'Cyber', 'Digital', 'Pixel', 'Binary', 'Code',
  'Apex', 'Zenith', 'Peak', 'Summit', 'Pinnacle', 'Ultimate',
  'Inferno', 'Volcano', 'Eruption', 'Magma', 'Lava', 'Fire',
  'Frost', 'Glacier', 'Snowstorm', 'Blizzard', 'Ice', 'Freeze',
  'Tsunami', 'Whirlpool', 'Tornado', 'Cyclone', 'Hurricane', 'Tempest',
  'Venom', 'Poison', 'Toxic', 'Decay', 'Ruin', 'Doom',
  'Ascend', 'Infinity', 'Eternal', 'Immortal', 'Divine', 'Godly',
  'Stealth', 'Silent', 'Quiet', 'Whisper', 'Echo', 'Void',
  'Nexus', 'Portal', 'Dimension', 'Universe', 'Galaxy', 'Cosmos'
];

const personalities: Array<'aggressive' | 'conservative' | 'balanced' | 'lucky'> = [
  'aggressive', 'conservative', 'balanced', 'lucky'
];

export function generateAIPlayers(count: number = 100): AIPlayer[] {
  const players: AIPlayer[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = `${names[i % names.length]}${i > names.length ? i : ''}`;
    const personality = personalities[i % personalities.length];
    
    players.push({
      id: uuidv4(),
      name,
      avatar: avatarUrls[i % avatarUrls.length],
      level: Math.floor(Math.random() * 50) + 1,
      status: 'idle',
      totalWins: Math.floor(Math.random() * 1000),
      points: Math.floor(Math.random() * 50000) + 1000,
      personality
    });
  }
  
  return players;
}

export const aiPlayers = generateAIPlayers(100);
