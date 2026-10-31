import React, { useState } from 'react';
import {
  X, MapPin, Navigation, Sparkles, Award, Coins,
  CheckCircle2, Compass, Waves, Umbrella, Coffee, Clock
} from 'lucide-react';
import { DailyTask, LocationInfo } from '../types';
import { PATHEIN_LOCATIONS } from '../world/GameScene';
import { sound } from '../audio/soundSystem';

interface PatheinMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerPos: { x: number; z: number };
  playerYaw: number;
  tasks: DailyTask[];
  onTeleport: (locationId: string) => void;
  currentDistrictId?: string | null;
}

export const PatheinMapModal: React.FC<PatheinMapModalProps> = ({
  isOpen,
  onClose,
  playerPos,
  playerYaw,
  tasks,
  onTeleport,
  currentDistrictId,
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    currentDistrictId || 'shwemokhtaw'
  );

  if (!isOpen) return null;

  // Map coordinate conversion: World X (-120 to 120), Z (-100 to 80)
  const mapWidth = 240;
  const mapHeight = 180;
  const toMapX = (worldX: number) => Math.max(5, Math.min(95, ((worldX + 120) / mapWidth) * 100));
  const toMapY = (worldZ: number) => Math.max(5, Math.min(95, ((worldZ + 100) / mapHeight) * 100));

  const selectedLoc = PATHEIN_LOCATIONS.find(l => l.id === selectedLocationId) || PATHEIN_LOCATIONS[0];

  // Find tasks associated with each location
  const getTasksForLocation = (locId: string) => tasks.filter(t => t.locationId === locId);
  const selectedTasks = getTasksForLocation(selectedLocationId);

  // Landmark visual icons mapping
  const getLandmarkIcon = (locId: string) => {
    switch (locId) {
      case 'shwemokhtaw':
        return <Sparkles className="w-5 h-5 text-yellow-300" />;
      case 'riverfront':
        return <Waves className="w-5 h-5 text-cyan-300" />;
      case 'umbrella_market':
        return <Umbrella className="w-5 h-5 text-rose-300" />;
      case 'downtown':
        return <Clock className="w-5 h-5 text-amber-300" />;
      case 'social_park':
        return <Coffee className="w-5 h-5 text-emerald-300" />;
      default:
        return <MapPin className="w-5 h-5 text-amber-300" />;
    }
  };

  const handleTravel = (locId: string) => {
    onTeleport(locId);
    sound.playInteraction();
    onClose();
  };

  // Distance from player to selected location
  const dist = Math.round(
    Math.sqrt(
      Math.pow(playerPos.x - selectedLoc.position.x, 2) +
      Math.pow(playerPos.z - selectedLoc.position.z, 2)
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/80 select-none pointer-events-auto">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[820px] bg-slate-900 border-2 border-amber-500/50 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-800 to-amber-950 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-100 flex items-center gap-2">
                <span>ပုသိမ်မြို့တော် လမ်းညွှန်မြေပုံ</span>
                <span className="text-[11px] font-normal text-amber-300">(Pathein City Map & Quests)</span>
              </h2>
              <p className="text-[10px] text-amber-200/80">
                ဘယ်နေရာမှာ ဘယ်တာဝန်လုပ်ရမည်ကို ကြည့်ရှု၍ သွားလိုသည့်နေရာကို ချက်ချင်းရွေးချယ်ပါ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/30 text-amber-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content: Map & Navigation Panel */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Left: Interactive 2D Tactical City Map */}
          <div className="flex-1 relative bg-slate-950 p-2 sm:p-4 flex flex-col justify-between overflow-hidden min-h-[300px]">
            {/* 2D Map Container */}
            <div className="relative w-full h-full rounded-2xl bg-[#09111c] border border-amber-500/30 overflow-hidden shadow-inner">
              {/* Compass Grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_75%)] pointer-events-none" />
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

              {/* Pathein River at North/Top */}
              <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-cyan-950/80 to-cyan-900/40 border-b border-cyan-500/30 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-[10px] sm:text-xs font-bold text-cyan-300 tracking-widest flex items-center justify-center gap-1.5">
                    <Waves className="w-3.5 h-3.5" /> ပုသိမ်မြစ် (PATHEIN RIVER)
                  </span>
                  <span className="text-[9px] text-cyan-400/60 block">Ayeyarwady Delta Waterway</span>
                </div>
              </div>

              {/* Roads / Boulevards overlay */}
              {/* Strand Road */}
              <div className="absolute top-16 sm:top-20 left-0 right-0 h-3 bg-slate-800/80 border-y border-slate-700/60" />
              {/* Central Avenue */}
              <div className="absolute top-18 bottom-10 left-1/2 -translate-x-1/2 w-4 sm:w-6 bg-slate-800/80 border-x border-slate-700/60" />
              {/* East-West Downtown Street */}
              <div className="absolute top-1/2 left-10 right-10 h-4 bg-slate-800/80 border-y border-slate-700/60" />

              {/* 5 City Landmarks & Task Pins */}
              {PATHEIN_LOCATIONS.map(loc => {
                const x = toMapX(loc.position.x);
                const y = toMapY(loc.position.z);
                const isSelected = selectedLocationId === loc.id;
                const locTasks = getTasksForLocation(loc.id);
                const hasPendingTask = locTasks.some(t => !t.isCompleted);
                const isCurrent = currentDistrictId === loc.id;

                return (
                  <div
                    key={loc.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => setSelectedLocationId(loc.id)}
                  >
                    {/* Landmark Marker Pin */}
                    <div
                      className={`relative px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 border shadow-xl transition-all duration-200 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-yellow-200 scale-110 ring-4 ring-amber-400/30'
                          : 'bg-slate-900/90 text-amber-200 border-amber-500/40 hover:bg-slate-800 hover:scale-105'
                      }`}
                    >
                      <div className="shrink-0">{getLandmarkIcon(loc.id)}</div>
                      <div className="hidden sm:block text-left">
                        <span className="text-[11px] font-bold block leading-tight">
                          {loc.burmeseName}
                        </span>
                        <span className="text-[9px] opacity-75 block">{loc.englishName}</span>
                      </div>

                      {/* Quest Indicator Badge */}
                      {locTasks.length > 0 && (
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            hasPendingTask
                              ? 'bg-rose-500 text-white animate-bounce'
                              : 'bg-emerald-500 text-white'
                          }`}
                          title={hasPendingTask ? 'Active Quest Available' : 'Quests Completed'}
                        >
                          {hasPendingTask ? '!' : '✓'}
                        </div>
                      )}
                    </div>

                    {/* Small mobile badge below pin */}
                    <div className="sm:hidden text-center mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-[8px] font-semibold text-amber-200 border border-amber-500/30 whitespace-nowrap">
                        {loc.burmeseName}
                      </span>
                    </div>

                    {/* Current location label */}
                    {isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[8px] font-bold whitespace-nowrap shadow">
                        သင်ရှိနေသည် (HERE)
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Player Real-time GPS Position Beacon */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-150"
                style={{
                  left: `${toMapX(playerPos.x)}%`,
                  top: `${toMapY(playerPos.z)}%`,
                }}
              >
                {/* Pulsing ring */}
                <div className="w-8 h-8 -ml-2 -mt-2 rounded-full bg-rose-500/30 animate-ping absolute" />
                {/* Player direction arrow */}
                <div
                  className="w-5 h-5 flex items-center justify-center"
                  style={{ transform: `rotate(${playerYaw}rad)` }}
                >
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-rose-500 drop-shadow-md" />
                </div>
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-2 left-2 p-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[9px] text-slate-400 space-y-0.5 pointer-events-none hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span>အနီရောင် ! = ပြီးမြောက်ရန် တာဝန်ရှိသည့်နေရာ (Active Quest)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>အစိမ်းရောင် ✓ = ပြီးစီးပြီးသား တာဝန် (Completed)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Selected Location Detail Card & Fast Travel Panel */}
          <div className="w-full lg:w-80 p-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Destination Title & Highlight */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    {getLandmarkIcon(selectedLoc.id)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-200">
                      {selectedLoc.burmeseName}
                    </h3>
                    <p className="text-[10px] text-slate-400">{selectedLoc.englishName}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {selectedLoc.description}
                </p>
                <div className="text-[11px] text-amber-300/90 font-medium">
                  ✨ {selectedLoc.highlight}
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-1.5">
                  <span>လက်ရှိအကွာအဝေး (Distance):</span>
                  <span className="font-bold text-amber-400">{dist} မီတာ</span>
                </div>
              </div>

              {/* Tasks Available At This Landmark */}
              <div>
                <h4 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>ဤနေရာတွင် လုပ်ဆောင်ရမည့် တာဝန်များ (Quests)</span>
                </h4>

                {selectedTasks.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 text-center">
                    ဤနေရာတွင် သီးသန့်တာဝန် မရှိသေးပါ (အေးဆေးစွာ လည်ပတ်နိုင်ပါသည်)
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTasks.map(t => (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          t.isCompleted
                            ? 'bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-slate-800/90 border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-100">
                              {t.isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                              )}
                              <span>{t.burmeseTitle}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 ml-3.5 mt-0.5">{t.burmeseDesc}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
                              <Coins className="w-3 h-3" /> +{t.rewardKyats}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Select Buttons for Other Locations */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">
                  အခြားနေရာ ရွေးချယ်ရန် (Other Landmarks):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PATHEIN_LOCATIONS.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLocationId(l.id)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold text-left truncate border transition-all ${
                        selectedLocationId === l.id
                          ? 'bg-amber-600 text-white border-amber-400 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {l.burmeseName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Action Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => handleTravel(selectedLocationId)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Navigation className="w-4 h-4 fill-slate-950" />
                <span>{selectedLoc.burmeseName} သို့ ချက်ချင်းသွားမည် (Fast Travel)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
