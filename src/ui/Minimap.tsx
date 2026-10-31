import React from 'react';
import { Maximize2, Sparkles, Waves, Umbrella, Clock, Coffee } from 'lucide-react';
import { PATHEIN_LOCATIONS } from '../world/GameScene';
import { DailyTask } from '../types';

interface MinimapProps {
  playerPos: { x: number; z: number };
  playerYaw: number;
  onOpenFullMap?: () => void;
  onTeleport?: (locId: string) => void;
  tasks?: DailyTask[];
}

export const Minimap: React.FC<MinimapProps> = ({ playerPos, playerYaw, onOpenFullMap, tasks }) => {
  // Map bounds: X: -120 to 120 (width 240), Z: -100 to 80 (height 180)
  const mapWidth = 240;
  const mapHeight = 180;

  const toMapX = (worldX: number) => ((worldX + 120) / mapWidth) * 100;
  const toMapY = (worldZ: number) => ((worldZ + 100) / mapHeight) * 100;

  return (
    <div
      onClick={onOpenFullMap}
      className="relative w-36 h-36 rounded-2xl bg-slate-950/85 border-2 border-amber-500/50 shadow-2xl overflow-hidden p-1.5 select-none pointer-events-auto cursor-pointer group hover:border-yellow-400 transition-colors"
      title="Tap to open full Pathein City Map & Quests"
    >
      {/* Compass / Radar Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* River representation on map top */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-cyan-900/40 border-b border-cyan-500/30 flex items-center justify-center">
        <span className="text-[8px] font-bold text-cyan-300 tracking-wider">ပုသိမ်မြစ် (RIVER)</span>
      </div>

      {/* Landmarks Pins with Task Indicators */}
      {PATHEIN_LOCATIONS.map(loc => {
        const x = toMapX(loc.position.x);
        const y = toMapY(loc.position.z);
        const hasTask = tasks?.some(t => t.locationId === loc.id && !t.isCompleted);

        return (
          <div
            key={loc.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shadow transition-transform ${
                hasTask
                  ? 'bg-rose-500 border-yellow-300 scale-110'
                  : 'bg-amber-500 border-yellow-200'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
          </div>
        );
      })}

      {/* Player Position & Orientation Arrow */}
      <div
        className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-75"
        style={{
          left: `${toMapX(playerPos.x)}%`,
          top: `${toMapY(playerPos.z)}%`,
          transform: `translate(-50%, -50%) rotate(${playerYaw}rad)`,
        }}
      >
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-rose-500 drop-shadow" />
      </div>

      {/* Expand icon & label */}
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/95 text-[8px] font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
        <Maximize2 className="w-2.5 h-2.5" />
        <span>မြေပုံကြီး (MAP)</span>
      </div>
    </div>
  );
};
