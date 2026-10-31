import React, { useState } from 'react';
import {
  Sun, Sunset, Moon, Volume2, VolumeX, Eye, Camera,
  BookOpen, MessageSquare, ChevronDown, ChevronUp,
  MapPin, Sparkles, User, Coffee, Navigation, CloudRain
} from 'lucide-react';
import { CameraMode, CharacterAction, InteractiveSpot, LocationInfo, TimeOfDay, WeatherType } from '../types';
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
  onTriggerEmote,
  playerPos,
  playerYaw,
  onTeleportDistrict,
  unreadChatCount,
  isHoldingUmbrella,
  onToggleUmbrella,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'landmarks' | 'emotes' | 'environment'>('landmarks');

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between">
      {/* 1. Top Navigation & Status Bar */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
        {/* Left: Game Title Badge & District Pill */}
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
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            {/* Weather System Toggle Button */}
            <button
              onClick={onToggleWeather}
              className={`px-3 py-1.5 rounded-xl border shadow text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all ${
                weather === 'tropical_rain'
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-cyan-900/50'
                  : 'bg-slate-900/85 border-amber-500/30 text-amber-300'
              }`}
              title="Toggle Light Tropical Rain (မိုးဖွဲဖွဲ)"
            >
              <CloudRain className={`w-4 h-4 ${weather === 'tropical_rain' ? 'text-cyan-300' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {weather === 'tropical_rain' ? 'မိုးဖွဲ (Rain)' : 'နေသာ (Clear)'}
              </span>
            </button>

            {/* Pathein Heritage Guide Button */}
            <button
              onClick={onOpenInfo}
              className="px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-amber-500/30 text-amber-300 shadow text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
              title="Pathein Cultural Guide"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">ပုသိမ်လမ်းညွှန် (Guide)</span>
            </button>

            {/* Social Chat Button */}
            <button
              onClick={onOpenChat}
              className="relative px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-amber-500/30 text-amber-300 shadow text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
              title="Social Chat"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">စကားဝိုင်း (Chat)</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Audio Mute Switch */}
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-xl border shadow active:scale-95 transition-all ${
                isMuted
                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900/85 border-amber-500/30 text-amber-300'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Radar Minimap */}
          <div className="hidden sm:block">
            <Minimap
              playerPos={playerPos}
              playerYaw={playerYaw}
              onTeleport={onTeleportDistrict}
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
            {/* Dock Tabs */}
            <div className="flex items-center justify-center gap-1 border-b border-slate-800 pb-1.5 text-xs">
              <button
                onClick={() => setActiveTab('landmarks')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === 'landmarks'
                    ? 'bg-amber-600 text-amber-50 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                နေရာများ (Landmarks)
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

            {/* Tab 1: Fast Landmarks Teleport */}
            {activeTab === 'landmarks' && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => onTeleportDistrict('shwemokhtaw')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-500/30 text-amber-200 text-[11px] whitespace-nowrap active:scale-95 transition-transform"
                >
                  ရွှေမုဋ္ဌောဘုရား (Pagoda)
                </button>
                <button
                  onClick={() => onTeleportDistrict('riverfront')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-200 text-[11px] whitespace-nowrap active:scale-95 transition-transform"
                >
                  မြစ်ကမ်းနား (Riverfront)
                </button>
                <button
                  onClick={() => onTeleportDistrict('umbrella_market')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-200 text-[11px] whitespace-nowrap active:scale-95 transition-transform"
                >
                  ပုသိမ်ထီးဈေး (Market)
                </button>
                <button
                  onClick={() => onTeleportDistrict('downtown')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-yellow-200 text-[11px] whitespace-nowrap active:scale-95 transition-transform"
                >
                  ပုသိမ်မြို့လယ် (Downtown)
                </button>
                <button
                  onClick={() => onTeleportDistrict('social_park')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-200 text-[11px] whitespace-nowrap active:scale-95 transition-transform"
                >
                  လက်ဖက်ရည်ဆိုင် (Tea Cafe)
                </button>
              </div>
            )}

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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
