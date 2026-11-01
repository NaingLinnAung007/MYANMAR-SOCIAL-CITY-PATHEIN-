import React, { useRef, useState } from 'react';
import { Compass, Sparkles, Umbrella, ArrowUp, Zap, Armchair, Plus, Minus } from 'lucide-react';

interface VirtualJoystickProps {
  onMove: (move: { x: number; z: number }) => void;
  onSprintToggle: (sprint: boolean) => void;
  onJump: () => void;
  onSitToggle?: () => void;
  isSitting?: boolean;
  onAction: () => void;
  onUmbrellaToggle: () => void;
  isHoldingUmbrella: boolean;
  isSprinting: boolean;
  nearActionLabel?: string | null;
  onCameraRotate: (deltaX: number, deltaY: number) => void;
  onCameraZoom?: (delta: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onSprintToggle,
  onJump,
  onSitToggle,
  isSitting = false,
  onAction,
  onUmbrellaToggle,
  isHoldingUmbrella,
  isSprinting,
  nearActionLabel,
  onCameraRotate,
  onCameraZoom,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const touchAreaRightRef = useRef<HTMLDivElement>(null);
  const [thumbPos, setThumbPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const activeTouchId = useRef<number | null>(null);

  // Right-side swipe look tracking
  const lookTouchId = useRef<number | null>(null);
  const lastTouchPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Joystick Touch
  const handleJoystickStart = (e: React.TouchEvent) => {
    if (activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    setIsDragging(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        activeTouchId.current = null;
        setIsDragging(false);
        setThumbPos({ x: 0, y: 0 });
        onMove({ x: 0, z: 0 });
        break;
      }
    }
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2 - 12;

    const distance = Math.sqrt(dx * dx + dy * dy);
    // Deadzone to prevent micro-jitter
    if (distance < 7) {
      setThumbPos({ x: 0, y: 0 });
      onMove({ x: 0, z: 0 });
      return;
    }

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);

    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    setThumbPos({ x: thumbX, y: thumbY });

    // Normalized move vector (-1 to 1) with ergonomic exponential curve
    const ratio = clampedDist / maxRadius;
    const smoothFactor = ratio * ratio; // Cubic/Quadratic response for precision
    const normX = (thumbX / clampedDist) * smoothFactor;
    const normZ = (-thumbY / clampedDist) * smoothFactor;
    onMove({ x: normX, z: normZ });
  };

  // Handle Right Screen Drag for Camera Orbit on Mobile
  const handleLookStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastTouchPos.current.x;
        const dy = touch.clientY - lastTouchPos.current.y;
        lastTouchPos.current = { x: touch.clientX, y: touch.clientY };

        // Comfortably calibrated swipe sensitivity
        onCameraRotate(dx * 0.0038, dy * 0.003);
        break;
      }
    }
  };

  const handleLookEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  };

  return (
    <>
      {/* Invisible Touch Look Pad on Right Screen Half (Mobile swipe look 360°) */}
      <div
        ref={touchAreaRightRef}
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        onTouchCancel={handleLookEnd}
        className="absolute top-24 right-0 bottom-40 left-1/2 z-10 touch-none pointer-events-auto"
        aria-hidden="true"
      />

      {/* Mobile Virtual Joystick on Bottom Left - Clean & Ergonomic */}
      <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 landscape:bottom-2.5 landscape:left-4 z-20 pointer-events-auto select-none touch-none opacity-85 hover:opacity-100 transition-opacity">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          className="relative w-24 h-24 sm:w-28 sm:h-28 landscape:w-24 landscape:h-24 rounded-full bg-slate-950/75 border-2 border-amber-500/35 shadow-2xl flex items-center justify-center backdrop-blur-md"
        >
          {/* Directional markers */}
          <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
            <Compass className="w-12 h-12 sm:w-14 sm:h-14 landscape:w-12 landscape:h-12 text-amber-400" />
          </div>

          {/* Draggable thumb */}
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 landscape:w-10 landscape:h-10 rounded-full shadow-lg border-2 border-amber-400 flex items-center justify-center transition-transform duration-75 ${
              isDragging ? 'bg-amber-500 text-slate-950 scale-105' : 'bg-amber-600/75 text-amber-100'
            }`}
            style={{
              transform: `translate(${thumbPos.x}px, ${thumbPos.y}px)`,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-200" />
          </div>
        </div>
        <div className="text-center mt-0.5 text-[8px] sm:text-[9px] font-bold text-amber-300/80 tracking-wider">
          MOVE
        </div>
      </div>

      {/* Quick Camera Zoom (+/-) buttons on right screen border */}
      {onCameraZoom && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 landscape:right-3 z-20 flex flex-col gap-1.5 sm:gap-2 pointer-events-auto select-none">
          <button
            onClick={() => onCameraZoom(-1.5)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-amber-600 border border-amber-500/50 text-amber-200 font-bold flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
            title="Zoom In (အနီးသို့ ချဲ့မည် ＋)"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onCameraZoom(1.5)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-amber-600 border border-amber-500/50 text-amber-200 font-bold flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
            title="Zoom Out (အဝေးသို့ ချုံ့မည် －)"
          >
            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Action Buttons on Bottom Right - Ergonomically spaced for landscape thumbs */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 landscape:bottom-2.5 landscape:right-4 z-20 flex flex-col items-end gap-1.5 sm:gap-2.5 pointer-events-auto select-none opacity-85 hover:opacity-100 transition-opacity">
        {/* Context Interaction Button (e.g. Ring Bell, Taste Halawa, Sit, Ride Coaster) */}
        {nearActionLabel && (
          <button
            onClick={onAction}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-2xl border-2 border-yellow-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 mb-1 animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>{nearActionLabel}</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* Sit / Stand button (ထိုင်/ထ စနစ် - E key equivalent) */}
          {onSitToggle && (
            <button
              onClick={onSitToggle}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border shadow-lg flex flex-col items-center justify-center active:scale-90 transition-all backdrop-blur-md ${
                isSitting
                  ? 'bg-amber-500/90 border-yellow-200 text-slate-950 ring-2 ring-amber-400'
                  : 'bg-slate-900/60 border-amber-500/30 text-amber-300 hover:bg-slate-900/90'
              }`}
              title="Sit / Stand (လက်ဖက်ရည်ဆိုင် ကုလားထိုင် ထိုင်မည်/ထမည်)"
            >
              <Armchair className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[9px] font-semibold leading-none mt-0.5">
                {isSitting ? 'ထမည်' : 'ထိုင်'}
              </span>
            </button>
          )}

          {/* Umbrella toggle button */}
          <button
            onClick={onUmbrellaToggle}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border shadow-lg flex flex-col items-center justify-center active:scale-90 transition-all backdrop-blur-md ${
              isHoldingUmbrella
                ? 'bg-red-600/90 border-red-300 text-white'
                : 'bg-slate-900/60 border-amber-500/30 text-amber-300 hover:bg-slate-900/90'
            }`}
            title="Pathein Umbrella (ပုသိမ်ထီး)"
          >
            <Umbrella className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[8px] sm:text-[9px] font-semibold leading-none mt-0.5">ထီး</span>
          </button>

          {/* Sprint Toggle */}
          <button
            onClick={() => onSprintToggle(!isSprinting)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border shadow-lg flex flex-col items-center justify-center active:scale-90 transition-all backdrop-blur-md ${
              isSprinting
                ? 'bg-amber-500/90 border-yellow-200 text-slate-950 ring-2 ring-yellow-400'
                : 'bg-slate-900/60 border-amber-500/30 text-slate-200 hover:bg-slate-900/90'
            }`}
            title="Sprint / Run (ပြေး)"
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[8px] sm:text-[9px] font-semibold leading-none mt-0.5">ပြေး</span>
          </button>

          {/* Jump Button */}
          <button
            onClick={onJump}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-600/90 via-amber-500/90 to-yellow-500/90 border-2 border-yellow-300 text-slate-950 font-black shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-all backdrop-blur-md"
            title="Jump (ခုန်မည်)"
          >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            <span className="text-[8px] sm:text-[9px] font-bold leading-none">ခုန်</span>
          </button>
        </div>
      </div>
    </>
  );
};
