import React, { useRef, useState, useEffect } from 'react';
import { Compass, Sparkles, Umbrella, ArrowUp, Zap } from 'lucide-react';

interface VirtualJoystickProps {
  onMove: (move: { x: number; z: number }) => void;
  onSprintToggle: (sprint: boolean) => void;
  onJump: () => void;
  onAction: () => void;
  onUmbrellaToggle: () => void;
  isHoldingUmbrella: boolean;
  isSprinting: boolean;
  nearActionLabel?: string | null;
  onCameraRotate: (deltaX: number, deltaY: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onSprintToggle,
  onJump,
  onAction,
  onUmbrellaToggle,
  isHoldingUmbrella,
  isSprinting,
  nearActionLabel,
  onCameraRotate,
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
    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);

    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    setThumbPos({ x: thumbX, y: thumbY });

    // Normalized move vector (-1 to 1)
    const normX = thumbX / maxRadius;
    const normZ = -thumbY / maxRadius; // Forward is negative Y on screen
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

        onCameraRotate(dx * 0.006, dy * 0.005);
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
      {/* Invisible Touch Look Pad on Right Screen Half (Mobile swipe look) */}
      <div
        ref={touchAreaRightRef}
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        onTouchCancel={handleLookEnd}
        className="absolute top-20 right-0 bottom-44 left-1/2 z-10 touch-none pointer-events-auto"
        aria-hidden="true"
      />

      {/* Mobile Virtual Joystick on Bottom Left */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto select-none touch-none">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          className="relative w-32 h-32 rounded-full bg-slate-950/70 border-2 border-amber-500/40 shadow-2xl flex items-center justify-center backdrop-blur-none"
        >
          {/* Directional markers */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <Compass className="w-16 h-16 text-amber-400" />
          </div>

          {/* Draggable thumb */}
          <div
            className={`w-14 h-14 rounded-full shadow-lg border-2 border-amber-400 flex items-center justify-center transition-transform duration-75 ${
              isDragging ? 'bg-amber-500 text-slate-950 scale-105' : 'bg-amber-600/80 text-amber-100'
            }`}
            style={{
              transform: `translate(${thumbPos.x}px, ${thumbPos.y}px)`,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-amber-200" />
          </div>
        </div>
        <div className="text-center mt-1 text-[11px] font-medium text-amber-300/80 tracking-wider">
          လမ်းလျှောက် (MOVE)
        </div>
      </div>

      {/* Action Buttons on Bottom Right */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-3 pointer-events-auto select-none">
        {/* Context Interaction Button (e.g. Ring Bell, Taste Halawa, Sit) */}
        {nearActionLabel && (
          <button
            onClick={onAction}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-xl border border-yellow-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{nearActionLabel}</span>
          </button>
        )}

        <div className="flex items-center gap-2.5">
          {/* Umbrella toggle button */}
          <button
            onClick={onUmbrellaToggle}
            className={`w-12 h-12 rounded-full border shadow-lg flex flex-col items-center justify-center active:scale-90 transition-all ${
              isHoldingUmbrella
                ? 'bg-red-600 border-red-300 text-white'
                : 'bg-slate-900/80 border-slate-600 text-amber-300'
            }`}
            title="Pathein Umbrella (ပုသိမ်ထီး)"
          >
            <Umbrella className="w-5 h-5" />
            <span className="text-[9px] font-semibold leading-none mt-0.5">ထီး</span>
          </button>

          {/* Sprint Toggle */}
          <button
            onClick={() => onSprintToggle(!isSprinting)}
            className={`w-12 h-12 rounded-full border shadow-lg flex flex-col items-center justify-center active:scale-90 transition-all ${
              isSprinting
                ? 'bg-amber-500 border-yellow-200 text-slate-950'
                : 'bg-slate-900/80 border-slate-600 text-slate-200'
            }`}
            title="Sprint / Run (အပြေး)"
          >
            <Zap className="w-5 h-5" />
            <span className="text-[9px] font-semibold leading-none mt-0.5">ပြေး</span>
          </button>

          {/* Jump Button */}
          <button
            onClick={onJump}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-yellow-600 border-2 border-yellow-400 text-slate-950 font-bold shadow-xl flex flex-col items-center justify-center active:scale-90 transition-all"
            title="Jump (ခုန်မည်)"
          >
            <ArrowUp className="w-6 h-6 stroke-[3]" />
            <span className="text-[9px] font-bold leading-none">ခုန်</span>
          </button>
        </div>
      </div>
    </>
  );
};
