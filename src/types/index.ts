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
}

export interface ColliderBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
}
