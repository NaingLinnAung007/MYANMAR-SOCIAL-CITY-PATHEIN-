import React, { useState } from 'react';
import {
  Sun, Sunset, Moon, Volume2, VolumeX, Eye, EyeOff, Camera,
  BookOpen, MessageSquare, ChevronDown, ChevronUp, Menu, X,
  MapPin, Sparkles, User, Coffee, Navigation, CloudRain,
  Award, Coins, Users, Flame, Mic, MicOff, Maximize, Minimize,
  Leaf, Utensils, Heart, Smile, ThumbsUp, Waves, Settings
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
  onSelectWeather?: (weather: WeatherType) => void;
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
  onOpenAccount: () => void;
  onOpenTeaMenu?: () => void;
  playerName: string;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
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
  onCameraZoom?: (delta: number) => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  currentDistrict,
  nearInteractive,
  onTriggerInteractive,
  timeOfDay,
  onTimeOfDayChange,
  weather,
  onToggleWeather,
  onSelectWeather,
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
  onOpenAccount,
  onOpenTeaMenu,
  playerName,
  isVoiceActive,
  onToggleVoice,
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
  // Clean View / Zen Mode - hides all UI clutter for supreme visual comfort
  const [isCleanMode, setIsCleanMode] = useState<boolean>(false);
  // All-in-One Menu Drawer
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  // Bottom Emote Bar (Closed by default to keep screen clean)
  const [isEmoteBarOpen, setIsEmoteBarOpen] = useState<boolean>(false);
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        try {
          (screen.orientation as any)?.lock('landscape').catch(() => {});
        } catch (_) {}
      }).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const claimableTaskCount = dailyTasks.filter(t => t.isCompleted && !t.isClaimed).length;
  const onlineFriendCount = friends.filter(f => f.status === 'online').length;

  // Emotes list
  const EMOTES_LIST: { id: CharacterAction; name: string; burmese: string; icon: string; key: string }[] = [
    { id: 'bow', name: 'Bow', burmese: 'ဦးချ', icon: '🙏', key: '1' },
    { id: 'pray', name: 'Pray', burmese: 'ရှိခိုး', icon: '✨', key: '2' },
    { id: 'tea_cheers', name: 'Tea Cheers', burmese: 'လက်ဖက်ရည်', icon: '☕', key: '4' },
    { id: 'umbrella_dance', name: 'Umbrella Dance', burmese: 'ထီးအက', icon: '☂️', key: '3' },
    { id: 'wave', name: 'Wave', burmese: 'နှုတ်ဆက်', icon: '👋', key: '5' },
    { id: 'clap', name: 'Clap', burmese: 'လက်ခုပ်', icon: '👏', key: '6' },
    { id: 'laugh', name: 'Smile', burmese: 'ပြုံးရွှင်', icon: '😀', key: '7' },
    { id: 'water_gun', name: 'Water Gun', burmese: 'ရေပြောင်း', icon: '🔫', key: '8' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between">
      {/* =========================================================================
          1. ZEN / CLEAN MODE CHIP (When Clean Mode is active, only this shows)
         ========================================================================= */}
      {isCleanMode ? (
        <div className="p-3 landscape:p-2 flex items-center justify-between w-full pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-950/75 border border-amber-500/35 text-amber-200 text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{currentDistrict?.burmeseName || 'ပုသိမ်မြို့'}</span>
            <span className="text-slate-500">|</span>
            <span className="text-[10px] text-amber-300/80">ရှုခင်းကြည့်မုဒ် (Zen View)</span>
          </div>

          <button
            onClick={() => setIsCleanMode(false)}
            className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs shadow-xl border border-yellow-200 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Show Controls (ခလုတ်များ ပြန်ဖွင့်မည်)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>UI ဖော်မည်</span>
          </button>
        </div>
      ) : (
        /* =========================================================================
            2. MODERN COMPACT TOP NAVIGATION (Sleek Glass Islands - Uncluttered)
           ========================================================================= */
        <div className="p-2 sm:p-4 landscape:p-2 flex items-start justify-between gap-2 pointer-events-auto">
          {/* Top-Left Island: Location & Map Shortcut */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-amber-500/35 rounded-2xl p-1 sm:p-1.5 shadow-xl backdrop-blur-md">
            {/* District Badge */}
            <div className="px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-500/25 flex items-center gap-1.5 max-w-[130px] sm:max-w-[180px]">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs font-bold text-amber-200 block truncate">
                  {currentDistrict?.burmeseName || 'ပုသိမ်မြို့'}
                </span>
                <span className="text-[9px] text-amber-400/70 hidden sm:block truncate">
                  {currentDistrict?.englishName || 'Pathein City'}
                </span>
              </div>
            </div>

            {/* Interactive City Map Button */}
            <button
              onClick={onOpenMap}
              className="px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow border border-yellow-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              title="Open Pathein Map & Tasks"
            >
              <Navigation className="w-3.5 h-3.5 fill-slate-950" />
              <span>မြေပုံ</span>
            </button>

            {/* Quick Weather Indicator / Cycle */}
            <button
              onClick={onToggleWeather}
              className="px-2 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-amber-300 text-xs font-medium flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              title="Change Weather (ရာသီဥတု ပြောင်းမည်)"
            >
              {weather === 'tropical_rain' && <CloudRain className="w-3.5 h-3.5 text-cyan-400" />}
              {weather === 'sunset_flares' && <Sunset className="w-3.5 h-3.5 text-orange-400" />}
              {weather === 'falling_leaves' && <Leaf className="w-3.5 h-3.5 text-emerald-400" />}
              {weather === 'clear' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span className="text-[11px] hidden sm:inline">
                {weather === 'tropical_rain' ? 'မိုးဖွဲ' : weather === 'sunset_flares' ? 'ဆည်းဆာ' : weather === 'falling_leaves' ? 'သစ်ရွက်' : 'နေသာ'}
              </span>
            </button>
          </div>

          {/* Top-Right Island: Player Stats & Essential Action Icons */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-amber-500/35 rounded-2xl p-1 sm:p-1.5 shadow-xl backdrop-blur-md">
            {/* Player Stats (Coin & Level) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-1 text-yellow-300 font-bold">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                <span>{playerStats.kyats}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Lv.{playerStats.level}</span>
              </div>
            </div>

            {/* Daily Tasks Button */}
            <button
              onClick={onOpenTasks}
              className={`relative px-2 sm:px-2.5 py-1 rounded-xl border shadow text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                claimableTaskCount > 0
                  ? 'bg-amber-600 text-yellow-100 border-yellow-300 animate-pulse'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-amber-300'
              }`}
              title="Daily Quests (နေ့စဉ်တာဝန်များ)"
            >
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">တာဝန်</span>
              {claimableTaskCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-bold">
                  +{claimableTaskCount}
                </span>
              )}
            </button>

            {/* Social Chat Button */}
            <button
              onClick={onOpenChat}
              className="relative p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-300 shadow text-xs font-medium flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              title="Live Chat (စကားဝိုင်း)"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">စကား</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Photo Mode Button */}
            <button
              onClick={onEnterPhotoMode}
              className="p-1.5 sm:px-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-300 shadow active:scale-95 transition-all cursor-pointer"
              title="Photo Studio (ဓာတ်ပုံ)"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
            </button>

            {/* Clean View / Zen Mode Toggle */}
            <button
              onClick={() => setIsCleanMode(true)}
              className="p-1.5 sm:px-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-cyan-300 shadow active:scale-95 transition-all cursor-pointer"
              title="Clean Mode (မျက်နှာပြင်ရှင်းလင်းစွာ ကြည့်ရှုမည်)"
            >
              <EyeOff className="w-3.5 h-3.5 text-cyan-300" />
            </button>

            {/* All-In-One Menu Button (Opens sleek drawer) */}
            <button
              onClick={() => setIsMenuDrawerOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              title="Open Menu (မီနူး)"
            >
              <Menu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">မီနူး</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. PROXIMITY INTERACTIVE PROMPT (Only shown when standing near spot)
         ========================================================================= */}
      {nearInteractive && !isCleanMode && (
        <div className="self-center mb-6 px-4 py-2 rounded-2xl bg-slate-950/90 border-2 border-yellow-400 text-center shadow-2xl pointer-events-auto transform animate-bounce duration-1000 max-w-xs sm:max-w-sm backdrop-blur-md">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs sm:text-sm font-bold text-yellow-300">
              {nearInteractive.burmeseTitle}
            </h3>
          </div>
          <button
            onClick={onTriggerInteractive}
            className="mt-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            {nearInteractive.burmeseActionText}
          </button>
        </div>
      )}

      {/* =========================================================================
          4. BOTTOM CENTER EMOTE BAR (Compact & Discreet)
         ========================================================================= */}
      {!isCleanMode && (
        <div className="pointer-events-auto self-center mb-2 flex flex-col items-center select-none">
          {/* Pop-up Emotes Tray */}
          {isEmoteBarOpen && (
            <div className="mb-1.5 p-1.5 rounded-2xl bg-slate-950/95 border border-amber-500/40 shadow-2xl backdrop-blur-md flex items-center gap-1.5 overflow-x-auto max-w-[94vw] sm:max-w-lg">
              {EMOTES_LIST.map(emote => (
                <button
                  key={emote.id}
                  onClick={() => {
                    onTriggerEmote(emote.id);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-600 text-amber-200 text-[11px] font-bold border border-slate-700/60 active:scale-95 transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer"
                  title={`Press [${emote.key}] key`}
                >
                  <span className="text-sm">{emote.icon}</span>
                  <span>{emote.burmese}</span>
                </button>
              ))}
            </div>
          )}

          {/* Discreet Emote Toggle Chip */}
          <button
            onClick={() => setIsEmoteBarOpen(!isEmoteBarOpen)}
            className="px-3 py-1 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-amber-500/30 text-amber-300 text-[11px] font-bold shadow-lg flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          >
            <Smile className="w-3.5 h-3.5 text-amber-400" />
            <span>အမူအရာ (Emotes)</span>
            {isEmoteBarOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      )}

      {/* =========================================================================
          5. ALL-IN-ONE CLEAN MENU DRAWER (Consolidates all menus cleanly)
         ========================================================================= */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
          <div className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            {/* Header */}
            <div className="px-5 py-3 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-amber-200">
                  ဂိမ်းထိန်းချုပ်မှု & မီနူး (Game Menu & Settings)
                </h2>
              </div>
              <button
                onClick={() => setIsMenuDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Section 1: Features & Navigation */}
              <div>
                <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                  အဓိက လုပ်ဆောင်ချက်များ (Main Features)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMenuDrawerOpen(false);
                      onOpenAccount();
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center gap-2.5 text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-200 block truncate">{playerName || 'ပုသိမ်သား'}</span>
                      <span className="text-[10px] text-slate-400">ဇာတ်ကောင် စိတ်ကြိုက်ပြင်</span>
                    </div>
                  </button>

                  {onOpenTeaMenu && (
                    <button
                      onClick={() => {
                        setIsMenuDrawerOpen(false);
                        onOpenTeaMenu();
                      }}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center gap-2.5 text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-yellow-400 flex items-center justify-center">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-yellow-200 block">လက်ဖက်ရည်ဆိုင်</span>
                        <span className="text-[10px] text-slate-400">မီနူး & အစားအသောက်</span>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuDrawerOpen(false);
                      onOpenFriends();
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center gap-2.5 text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-200 block">မိတ်ဆွေများ ({onlineFriendCount})</span>
                      <span className="text-[10px] text-slate-400">သူငယ်ချင်းစာရင်း</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuDrawerOpen(false);
                      onOpenInfo();
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center gap-2.5 text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-purple-200 block">ပုသိမ်လမ်းညွှန်</span>
                      <span className="text-[10px] text-slate-400">ယဉ်ကျေးမှု အမွေအနှစ်</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Section 2: Environment & Time */}
              <div>
                <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                  အချိန်နှင့် နေရောင်ခြည် (Time of Day)
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onTimeOfDayChange('day')}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                      timeOfDay === 'day'
                        ? 'bg-amber-500 text-slate-950 border-yellow-300'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>နေ့ခင်း (Day)</span>
                  </button>
                  <button
                    onClick={() => onTimeOfDayChange('sunset')}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                      timeOfDay === 'sunset'
                        ? 'bg-orange-500 text-slate-950 border-yellow-300'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Sunset className="w-4 h-4" />
                    <span>ဆည်းဆာ (Sunset)</span>
                  </button>
                  <button
                    onClick={() => onTimeOfDayChange('night')}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                      timeOfDay === 'night'
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>ညချမ်း (Night)</span>
                  </button>
                </div>
              </div>

              {/* Section 3: Weather */}
              {onSelectWeather && (
                <div>
                  <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                    ရာသီဥတု အထူးပြုလုပ်ချက် (Weather Overlays)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      onClick={() => onSelectWeather('clear')}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                        weather === 'clear'
                          ? 'bg-amber-500 text-slate-950 border-yellow-300'
                          : 'bg-slate-800/70 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>နေသာ</span>
                    </button>
                    <button
                      onClick={() => onSelectWeather('sunset_flares')}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                        weather === 'sunset_flares'
                          ? 'bg-orange-500 text-slate-950 border-yellow-300'
                          : 'bg-slate-800/70 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Sunset className="w-4 h-4" />
                      <span>ရွှေဆည်းဆာ</span>
                    </button>
                    <button
                      onClick={() => onSelectWeather('falling_leaves')}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                        weather === 'falling_leaves'
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-slate-800/70 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Leaf className="w-4 h-4" />
                      <span>သစ်ရွက်လေ</span>
                    </button>
                    <button
                      onClick={() => onSelectWeather('tropical_rain')}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                        weather === 'tropical_rain'
                          ? 'bg-cyan-600 text-white border-cyan-300'
                          : 'bg-slate-800/70 border-slate-700 text-slate-300'
                      }`}
                    >
                      <CloudRain className="w-4 h-4" />
                      <span>မိုးဖွဲဖွဲ</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Section 4: Camera Perspective */}
              <div>
                <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                  ကင်မရာ ရှုထောင့် (Camera Perspective)
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onCameraModeChange('third_person')}
                    className={`p-2 rounded-xl border font-bold text-center cursor-pointer ${
                      cameraMode === 'third_person'
                        ? 'bg-amber-500 text-slate-950 border-yellow-300'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300'
                    }`}
                  >
                    3rd Person
                  </button>
                  <button
                    onClick={() => onCameraModeChange('first_person')}
                    className={`p-2 rounded-xl border font-bold text-center cursor-pointer ${
                      cameraMode === 'first_person'
                        ? 'bg-amber-500 text-slate-950 border-yellow-300'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300'
                    }`}
                  >
                    1st Person
                  </button>
                  <button
                    onClick={() => onCameraModeChange('cinematic')}
                    className={`p-2 rounded-xl border font-bold text-center cursor-pointer ${
                      cameraMode === 'cinematic'
                        ? 'bg-amber-500 text-slate-950 border-yellow-300'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300'
                    }`}
                  >
                    Drone View
                  </button>
                </div>
              </div>

              {/* Section 5: Audio & Display Quick Toggles */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={onToggleVoice}
                  className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                    isVoiceActive
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300'
                  }`}
                >
                  {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{isVoiceActive ? 'မိုက်ဖွင့်ထား' : 'မိုက်ပိတ်ထား'}</span>
                </button>

                <button
                  onClick={onToggleMute}
                  className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                    isMuted
                      ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? 'အသံပိတ်ထား' : 'အသံဖွင့်ထား'}</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-amber-300 flex items-center justify-center cursor-pointer"
                  title="Landscape Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
