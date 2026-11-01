export type TimeOfDay = 'day' | 'sunset' | 'night';

export type WeatherType = 'clear' | 'tropical_rain' | 'sunset_flares' | 'falling_leaves';

export type CameraMode = 'third_person' | 'first_person' | 'cinematic';

export type SurfaceMaterialType = 'marble' | 'wood' | 'soil' | 'concrete';

export type CharacterGender = 'male' | 'female';

export type CharacterAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'sit'
  | 'pray'
  | 'bow'
  | 'umbrella_dance'
  | 'tea_cheers'
  | 'wave'
  | 'clap'
  | 'laugh'
  | 'water_gun';

export interface CharacterAppearance {
  gender: CharacterGender;
  shirtColor: string;
  longyiColor: string;
  longyiPattern: string;
  hairColor: string;
  hasThanaka: boolean;
  hasUmbrella: boolean;
  hasWaterGun: boolean;
  accountCode: string;
  playerName: string;
}

export interface LocationInfo {
  id: string;
  burmeseName: string;
  englishName: string;
  description: string;
  highlight: string;
  position: { x: number; z: number };
}

export interface InteractiveSpot {
  id: string;
  title: string;
  burmeseTitle: string;
  actionText: string;
  burmeseActionText: string;
  position: { x: number; y: number; z: number };
  radius: number;
  type: 'bell' | 'halawa' | 'tea' | 'umbrella' | 'pray' | 'scenic' | 'sit' | 'cinema' | 'coaster' | 'water_gun';
  description: string;
}

export interface TeaMenuItem {
  id: string;
  name: string;
  burmeseName: string;
  priceKyats: number;
  energyBonus: number;
  meritBonus: number;
  description: string;
  burmeseDesc: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  burmeseSender?: string;
  text: string;
  time: string;
  isSelf?: boolean;
  avatarColor: string;
  recipientId?: string; // If direct message
  photoUrl?: string;
  locationName?: string;
  isVoiceSim?: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  burmeseTitle: string;
  description: string;
  burmeseDesc: string;
  targetCount: number;
  currentCount: number;
  rewardKyats: number;
  rewardMerit: number;
  isCompleted: boolean;
  isClaimed: boolean;
  iconName: string;
  locationId: string;
}

export interface Friend {
  id: string;
  name: string;
  burmeseName: string;
  status: 'online' | 'busy' | 'offline';
  statusMessage?: string;
  currentLocation: string;
  burmeseLocation: string;
  avatarColor: string;
  level: number;
  position: { x: number; z: number };
}

export interface PlayerStats {
  kyats: number;
  meritPoints: number;
  level: number;
  luckyDrawCount: number;
  energy: number;
}

export interface ColliderBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
}


