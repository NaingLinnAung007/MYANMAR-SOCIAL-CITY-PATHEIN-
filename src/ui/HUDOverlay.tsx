import React, { useState } from 'react';
import {
  Sun, Sunset, Moon, Volume2, VolumeX, Eye, Camera,
  BookOpen, MessageSquare, ChevronDown, ChevronUp,
  MapPin, Sparkles, User, Coffee, Navigation, CloudRain,
  Award, Coins, Users, Flame
} from 'lucide-react';
import { CameraMode, CharacterAction, DailyTask, Friend, InteractiveSpot, LocationInfo, PlayerStats, TimeOfDay, WeatherType } from '../types';
import { Minimap } from './Minimap';

interface HUDOverlayProps {
  currentDistrict: LocationInfo | null;
  nearInteractive: InteractiveSpot | null;
  onTriggerInteractive: () => void;
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (time: TimeOfDay) => void;
  weather: WeatherType;
  onToggleWeather: () => void;
  cameraMode: CameraMode;
  onCameraModeChange: (mode: CameraMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenChat: () => void;
  onOpenInfo: () => void;
  onOpenTasks: () => void;
  onOpenFriends: () => void;
  onOpenMap: () => void;
  onEnterPhotoMode: () => void;
  dailyTasks: DailyTask[];
  friends: Friend[];
  playerStats: PlayerStats;
  onTriggerEmote: (emote: CharacterAction) => void;
  playerPos: { x: number; z: number };
  playerYaw: number;
  onTeleportDistrict: (locId: string) => void;
  unreadChatCount: number;
  isHoldingUmbrella: boolean;
  onToggleUmbrella: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  currentDistrict,
  nearInteractive,
  onTriggerInteractive,
  timeOfDay,
  onTimeOfDayChange,
  weather,
  onToggleWeather,
  cameraMode,
  onCameraModeChange,
  isMuted,
  onToggleMute,
  onOpenChat,
  onOpenInfo,
  onOpenTasks,
  onOpenFriends,
  onOpenMap,
  onEnterPhotoMode,
  dailyTasks,
  friends,
  playerStats,
  onTriggerEmote,
  playerPos,
  playerYaw,
  onTeleportDistrict,
  unreadChatCount,
  isHoldingUmbrella,
  onToggleUmbrella,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'emotes' | 'environment' | 'social'>('emotes');

  const claimableTaskCount = dailyTasks.filter(t => t.isCompleted && !t.isClaimed).length;
  const onlineFriendCount = friends.filter(f => f.status === 'online').length;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between">
      {/* 1. Top Navigation & Status Bar */}
      <div className="p-3.5 sm:p-5 flex items-start justify-between gap-3">
        {/* Left: Game Title Badge, District Pill, and Prominent City Map & Destination Button */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Main Title Badge */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 shadow-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-amber-200 tracking-wide font-sans">
                MYANMAR SOCIAL CITY – PATHEIN
              </h1>
              <p className="text-[10px] text-amber-300 font-medium">
                မြန်မာလူမှုမြို့တော် – ပုသိမ်မြို့
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Current District Discovery Badge */}
            {currentDistrict && (
              <div className="px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/30 shadow flex items-center gap-2 max-w-xs transition-all">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-semibold text-amber-100 block truncate">
                    {currentDistrict.burmeseName}
                  </span>
                  <span className="text-[9px] text-amber-300/80 block truncate">
                    {currentDistrict.englishName}
                  </span>
                </div>
              </div>
            )}

            {/* Prominent City Map & Destination Picker Button */}
            <button
              onClick={onOpenMap}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-xl border border-yellow-200 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Open Pathein Interactive Map & Quests"
            >
              <Navigation className="w-3.5 h-3.5 fill-slate-950" />
              <span>မြေပုံ & သွားမည့်နေရာ (City Map)</span>
            </button>
          </div>

          {/* Rain Alert Banner when weather is tropical_rain */}
          {weather === 'tropical_rain' && (
            <div className="px-3 py-1 rounded-lg bg-cyan-950/85 border border-cyan-400/40 text-cyan-200 shadow flex items-center gap-2 max-w-xs">
              <CloudRain className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="text-[10px] font-medium truncate">
                ပုသိမ်မြစ်ကမ်းနား မိုးဖွဲဖွဲရွာသွန်းနေသည် (Light Tropical Rain)
              </span>
              {!isHoldingUmbrella && (
                <button
                  onClick={onToggleUmbrella}
                  className="px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[9px] whitespace-nowrap ml-auto"
                >
                  ထီးဆောင်း
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls & Minimap */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Row 1: Player Stats & Quick Game Action Pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Player Stats Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/85 border border-amber-500/40 shadow text-[11px]">
              <div className="flex items-center gap-1 text-amber-300 font-bold" title="Player Level">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Lv.{playerStats.level}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1 text-yellow-300 font-bold" title="Pathein Kyats">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                <span>{playerStats.kyats}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1 text-cyan-300 font-bold" title="Merit Points">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{playerStats.meritPoints}</span>
              </div>
            </div>

            {/* Daily Tasks Button */}
            <button
              onClick={onOpenTasks}
              className={`relative px-2.5 sm:px-3 py-1 rounded-xl border shadow text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all ${
                claimableTaskCount > 0
                  ? 'bg-amber-600/90 border-yellow-300 text-yellow-100'
                  : 'bg-slate-900/85 border-amber-500/30 text-amber-300 hover:bg-slate-800'
              }`}
              title="Daily Quests (နေ့စဉ်တာဝန်များ)"
            >
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">တာဝန် (Quests)</span>
              {claimableTaskCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-bold">
                  +{claimableTaskCount}
                </span>
              ) : (
                <span className="text-[10px] text-amber-300 font-bold">
                  {dailyTasks.filter(t => t.isCompleted).length}/{dailyTasks.length}
                </span>
              )}
            </button>

            {/* Friends Button */}
            <button
              onClick={onOpenFriends}
              className="relative px-2.5 sm:px-3 py-1 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-amber-500/30 text-amber-300 shadow text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
              title="Friends (ပုသိမ် သူငယ်ချင်းများ)"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">မိတ်ဆွေ (Friends)</span>
              {onlineFriendCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40">
                  {onlineFriendCount}
                </span>
              )}
            </button>
          </div>

          {/* Row 2: Secondary buttons: Weather, Chat, Guide, Mute */}
          <div className="flex items-center gap-1.5">
            {/* Weather System Toggle Button */}
            <button
              onClick={onToggleWeather}
              className={`px-2.5 py-1 rounded-xl border shadow text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all ${
                weather === 'tropical_rain'
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
                  : 'bg-slate-900/85 border-amber-500/30 text-amber-300'
              }`}
              title="Toggle Light Tropical Rain (မိုးဖွဲဖွဲ)"
            >
              <CloudRain className={`w-3.5 h-3.5 ${weather === 'tropical_rain' ? 'text-cyan-300' : 'text-slate-400'}`} />
              <span className="hidden sm:inline text-[11px]">
                {weather === 'tropical_rain' ? 'မိုးဖွဲ' : 'နေသာ'}
              </span>
            </button>

            {/* Social Chat Button */}
            <button
              onClick={onOpenChat}
              className="relative px-2.5 py-1 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-amber-500/30 text-amber-300 shadow text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
              title="Social Chat"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">စကားဝိုင်း</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Photo Mode Button */}
            <button
              onClick={onEnterPhotoMode}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold shadow-md text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Pathein Photo Studio (ဓာတ်ပုံရိုက်မည်)"
            >
              <Camera className="w-3.5 h-3.5 fill-slate-950" />
              <span className="text-[11px]">ဓာတ်ပုံ (Photo)</span>
            </button>

            {/* Pathein Heritage Guide Button */}
            <button
              onClick={onOpenInfo}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-amber-500/30 text-amber-300 shadow text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
              title="Pathein Cultural Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline text-[11px]">လမ်းညွှန်</span>
            </button>

            {/* Audio Mute Switch */}
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-xl border shadow active:scale-95 transition-all ${
                isMuted
                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900/85 border-amber-500/30 text-amber-300'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Radar Minimap */}
          <div className="hidden sm:block">
            <Minimap
              playerPos={playerPos}
              playerYaw={playerYaw}
              onTeleport={onTeleportDistrict}
              onOpenFullMap={onOpenMap}
              tasks={dailyTasks}
            />
          </div>
        </div>
      </div>

      {/* 2. Proximity Interactive Banner (Center Screen Alert) */}
      {nearInteractive && (
        <div className="self-center mb-4 px-5 py-2.5 rounded-2xl bg-slate-950/90 border-2 border-yellow-400 text-center shadow-2xl pointer-events-auto transform animate-bounce duration-1000 max-w-sm sm:max-w-md">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs sm:text-sm font-bold text-yellow-300">
              {nearInteractive.burmeseTitle}
            </h3>
          </div>
          <p className="text-[11px] text-slate-300 mb-2">{nearInteractive.description}</p>
          <button
            onClick={onTriggerInteractive}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-transform"
          >
            {nearInteractive.burmeseActionText} ({nearInteractive.actionText})
          </button>
        </div>
      )}

      {/* 3. Consolidated Collapsible Bottom Dock (Zero Viewport Occlusion) */}
      <div className="pointer-events-auto self-center mb-3 flex flex-col items-center">
        {/* Dock Collapse Toggle Tab */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="px-4 py-1 rounded-t-xl bg-slate-950/90 hover:bg-slate-900 border-t border-x border-amber-500/40 text-amber-300 text-[11px] font-medium flex items-center gap-1 shadow-lg transition-colors cursor-pointer"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Controls (ထိန်းချုပ်ခလုတ်များ ဖွင့်မည်)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Cinema Mode (ဝှက်မည်)</span>
            </>
          )}
        </button>

        {/* Main Dock Container */}
        <div
          className={`transition-all duration-300 ease-out origin-bottom ${
            isDockCollapsed
              ? 'opacity-0 translate-y-12 pointer-events-none h-0 overflow-hidden'
              : 'opacity-100 translate-y-0 max-w-[94vw] w-auto'
          }`}
        >
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow-2xl flex flex-col gap-2">
            {/* Dock Tabs - Landmark selection moved away to top map modal */}
            <div className="flex items-center justify-center gap-1 border-b border-slate-800 pb-1.5 text-xs">
              <button
                onClick={() => setActiveTab('social')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  activeTab === 'social'
                    ? 'bg-amber-600 text-amber-50 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>မိတ်ဆွေ & တာဝန် (Social & Quests)</span>
                {claimableTaskCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('emotes')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'emotes'
                    ? 'bg-amber-600 text-amber-50 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                အမူအရာ (Emotes)
              </button>
              <button
                onClick={() => setActiveTab('environment')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'environment'
                    ? 'bg-amber-600 text-amber-50 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                အချိန်နှင့် ရှုထောင့် (View)
              </button>
            </div>

            {/* Tab 2: Myanmar Traditional Emotes */}
            {activeTab === 'emotes' && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => onTriggerEmote('bow')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-700 text-amber-200 text-[11px] font-semibold whitespace-nowrap border border-slate-700 active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>မင်္ဂလာပါ (Bow)</span>
                </button>
                <button
                  onClick={() => onTriggerEmote('pray')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-700 text-amber-200 text-[11px] font-semibold whitespace-nowrap border border-slate-700 active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>ရှိခိုးမည် (Pray)</span>
                </button>
                <button
                  onClick={() => onTriggerEmote('umbrella_dance')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-700 text-amber-200 text-[11px] font-semibold whitespace-nowrap border border-slate-700 active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>ထီးအက (Umbrella)</span>
                </button>
                <button
                  onClick={() => onTriggerEmote('sit')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-700 text-amber-200 text-[11px] font-semibold whitespace-nowrap border border-slate-700 active:scale-95 transition-all flex items-center gap-1"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>ထိုင်မည် (Sit)</span>
                </button>
              </div>
            )}

            {/* Tab 3: Time of Day, Weather & Camera View Mode */}
            {activeTab === 'environment' && (
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                {/* Weather System Toggle */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => weather !== 'clear' && onToggleWeather()}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] transition-all ${
                      weather === 'clear'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>နေသာ (Clear)</span>
                  </button>
                  <button
                    onClick={() => weather !== 'tropical_rain' && onToggleWeather()}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] transition-all ${
                      weather === 'tropical_rain'
                        ? 'bg-cyan-600 text-cyan-50 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>မိုးဖွဲ (Tropical Rain)</span>
                  </button>
                </div>

                {/* Time of Day */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => onTimeOfDayChange('day')}
                    className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] transition-all ${
                      timeOfDay === 'day'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>နေ့ (Day)</span>
                  </button>
                  <button
                    onClick={() => onTimeOfDayChange('sunset')}
                    className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] transition-all ${
                      timeOfDay === 'sunset'
                        ? 'bg-orange-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sunset className="w-3.5 h-3.5" />
                    <span>ဆည်းဆာ (Sunset)</span>
                  </button>
                  <button
                    onClick={() => onTimeOfDayChange('night')}
                    className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] transition-all ${
                      timeOfDay === 'night'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>ညချမ်း (Night)</span>
                  </button>
                </div>

                {/* Camera Mode */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => onCameraModeChange('third_person')}
                    className={`px-2 py-1 rounded-lg text-[11px] transition-all ${
                      cameraMode === 'third_person'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    3rd Person
                  </button>
                  <button
                    onClick={() => onCameraModeChange('first_person')}
                    className={`px-2 py-1 rounded-lg text-[11px] transition-all ${
                      cameraMode === 'first_person'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1st Person
                  </button>
                  <button
                    onClick={() => onCameraModeChange('cinematic')}
                    className={`px-2 py-1 rounded-lg text-[11px] transition-all ${
                      cameraMode === 'cinematic'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Drone Tour
                  </button>
                  <button
                    onClick={onEnterPhotoMode}
                    className="px-2 py-1 rounded-lg text-[11px] bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Photo Mode</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Social & Daily Quests Panel */}
            {activeTab === 'social' && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={onOpenTasks}
                  className="px-3 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-yellow-100 text-[11px] font-bold border border-yellow-400 flex items-center gap-1.5 shadow active:scale-95 transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>နေ့စဉ်တာဝန်များ ({dailyTasks.filter(t => t.isCompleted).length}/{dailyTasks.length})</span>
                </button>
                <button
                  onClick={onOpenFriends}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-700 text-amber-200 text-[11px] font-bold border border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>သူငယ်ချင်းများ ({onlineFriendCount} Online)</span>
                </button>
                <button
                  onClick={onOpenChat}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-700 text-amber-200 text-[11px] font-bold border border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>စကားဝိုင်းဖွင့်မည်</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
