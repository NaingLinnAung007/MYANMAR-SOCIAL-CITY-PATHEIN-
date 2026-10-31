export type TimeOfDay = 'day' | 'sunset' | 'night';

export type WeatherType = 'clear' | 'tropical_rain';

export type CameraMode = 'third_person' | 'first_person' | 'cinematic';

export type CharacterAction = 'idle' | 'walk' | 'run' | 'jump' | 'sit' | 'pray' | 'bow' | 'umbrella_dance';

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
  type: 'bell' | 'halawa' | 'tea' | 'umbrella' | 'pray' | 'scenic' | 'sit';
  description: string;
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
}

export interface ColliderBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
}
