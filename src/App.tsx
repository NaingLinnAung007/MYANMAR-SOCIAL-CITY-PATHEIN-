import React, { useEffect, useRef, useState } from 'react';
import { GameScene } from './world/GameScene';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { HUDOverlay } from './ui/HUDOverlay';
import { SocialChatModal } from './ui/SocialChatModal';
import { PatheinInfoModal } from './ui/PatheinInfoModal';
import { CameraMode, CharacterAction, ChatMessage, InteractiveSpot, LocationInfo, TimeOfDay, WeatherType } from './types';
import { sound } from './audio/soundSystem';

// Initial simulated chat messages from friendly Pathein residents
const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'Thuzar',
    burmeseSender: 'သူဇာ',
    text: 'မင်္ဂလာပါ! ပုသိမ်မြို့တော်မှ နွေးထွေးစွာ ကြိုဆိုပါတယ်။ (Welcome to Pathein City!)',
    time: '15:40',
    avatarColor: '#ec4899',
  },
  {
    id: 'm2',
    sender: 'Ko Aung',
    burmeseSender: 'ကိုအောင်',
    text: 'ရွှေမုဋ္ဌောဘုရားမှာ ခေါင်းလောင်းထိုးပြီး ကုသိုလ်ယူပြီးပါပြီ။ သာဓု သာဓု သာဓု!',
    time: '15:42',
    avatarColor: '#3b82f6',
  },
  {
    id: 'm3',
    sender: 'Daw Hla',
    burmeseSender: 'ဒေါ်လှလှ',
    text: 'ပုသိမ်ထီးဈေးတန်းမှာ အနီရောင်၊ ရွှေရောင် ထီးလှလှလေးတွေ အရမ်းလှတယ်နော်။',
    time: '15:44',
    avatarColor: '#10b981',
  },
  {
    id: 'm4',
    sender: 'Min Khant',
    burmeseSender: 'မင်းခန့်',
    text: 'ညနေစောင်းရင် မြစ်ကမ်းနား လေညှင်းခံရင်း သီရိဧရာ လက်ဖက်ရည်ဆိုင်မှာ ဆုံကြစို့!',
    time: '15:45',
    avatarColor: '#f59e0b',
  },
];

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const gameSceneRef = useRef<GameScene | null>(null);

  // Movement & Input states
  const moveInputRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const isJumpingRef = useRef<boolean>(false);

  // Camera Drag on Desktop
  const isMouseDownRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Game UI States
  const [currentDistrict, setCurrentDistrict] = useState<LocationInfo | null>(null);
  const [nearInteractive, setNearInteractive] = useState<InteractiveSpot | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('sunset');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [cameraMode, setCameraMode] = useState<CameraMode>('third_person');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHoldingUmbrella, setIsHoldingUmbrella] = useState<boolean>(false);

  // Modals & Chat
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  // Player position for minimap tracking
  const [playerPos, setPlayerPos] = useState<{ x: number; z: number }>({ x: 0, z: 18 });
  const [playerYaw, setPlayerYaw] = useState<number>(0);

  useEffect(() => {
    if (!canvasMountRef.current) return;

    // Instantiate Three.js game world
    const game = new GameScene(canvasMountRef.current);
    gameSceneRef.current = game;
    game.setTimeOfDay('sunset'); // Start with the iconic golden sunset

    // Wire up proximity listeners
    game.onDistrictChange = loc => {
      setCurrentDistrict(loc);
    };

    game.onNearbyInteractive = spot => {
      setNearInteractive(spot);
    };

    // Tracking loop for HUD Minimap
    const trackerInterval = setInterval(() => {
      if (gameSceneRef.current) {
        const char = gameSceneRef.current.character;
        setPlayerPos({ x: char.position.x, z: char.position.z });
        setPlayerYaw(char.rotation);
      }
    }, 100);

    // Keyboard handlers (WASD / Arrows / Shift / Space / E)
    const activeKeys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in chat
      if (document.activeElement?.tagName === 'INPUT') return;

      activeKeys[e.code] = true;

      if (e.code === 'KeyE') {
        if (nearInteractive && gameSceneRef.current) {
          gameSceneRef.current.triggerInteraction(nearInteractive);
        }
      } else if (e.code === 'KeyU') {
        if (gameSceneRef.current) {
          gameSceneRef.current.character.toggleUmbrella();
          setIsHoldingUmbrella(gameSceneRef.current.character.isHoldingUmbrella);
        }
      } else if (e.code === 'Space') {
        isJumpingRef.current = true;
      }

      updateMoveInputFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys[e.code] = false;
      if (e.code === 'Space') {
        isJumpingRef.current = false;
      }
      updateMoveInputFromKeys();
    };

    const updateMoveInputFromKeys = () => {
      let x = 0;
      let z = 0;

      if (activeKeys['KeyW'] || activeKeys['ArrowUp']) z += 1;
      if (activeKeys['KeyS'] || activeKeys['ArrowDown']) z -= 1;
      if (activeKeys['KeyA'] || activeKeys['ArrowLeft']) x -= 1;
      if (activeKeys['KeyD'] || activeKeys['ArrowRight']) x += 1;

      // Normalize diagonal
      const len = Math.sqrt(x * x + z * z);
      if (len > 0) {
        x /= len;
        z /= len;
      }

      moveInputRef.current = { x, z };
      setIsSprinting(!!activeKeys['ShiftLeft'] || !!activeKeys['ShiftRight']);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Desktop Mouse Drag to rotate camera
    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('.pointer-events-auto')) return;
      isMouseDownRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      sound.startAmbientAtmosphere();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !gameSceneRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      gameSceneRef.current.cameraAngleYaw -= dx * 0.005;
      gameSceneRef.current.cameraAnglePitch = Math.max(
        0.05,
        Math.min(1.2, gameSceneRef.current.cameraAnglePitch + dy * 0.004)
      );
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!gameSceneRef.current) return;
      gameSceneRef.current.cameraDistance = Math.max(
        3.5,
        Math.min(18.0, gameSceneRef.current.cameraDistance + e.deltaY * 0.01)
      );
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: true });

    // Character tick pump
    let characterAnimId = 0;
    let lastTime = performance.now();
    const characterTick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (gameSceneRef.current) {
        gameSceneRef.current.character.update(
          dt,
          moveInputRef.current,
          isSprinting,
          isJumpingRef.current,
          gameSceneRef.current.cameraAngleYaw,
          gameSceneRef.current.colliders
        );
      }
      characterAnimId = requestAnimationFrame(characterTick);
    };
    characterTick();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      clearInterval(trackerInterval);
      cancelAnimationFrame(characterAnimId);
      game.destroy();
      sound.stopAmbient();
    };
  }, [isSprinting, nearInteractive]);

  // Touch handlers
  const handleVirtualJoystickMove = (move: { x: number; z: number }) => {
    moveInputRef.current = move;
    sound.startAmbientAtmosphere();
  };

  const handleMobileCameraRotate = (deltaX: number, deltaY: number) => {
    if (!gameSceneRef.current) return;
    gameSceneRef.current.cameraAngleYaw -= deltaX;
    gameSceneRef.current.cameraAnglePitch = Math.max(
      0.05,
      Math.min(1.2, gameSceneRef.current.cameraAnglePitch + deltaY)
    );
  };

  const handleJump = () => {
    if (gameSceneRef.current) {
      gameSceneRef.current.character.setAction('jump');
    }
  };

  const handleInteractiveTrigger = () => {
    if (nearInteractive && gameSceneRef.current) {
      gameSceneRef.current.triggerInteraction(nearInteractive);
    }
  };

  const handleUmbrellaToggle = () => {
    if (gameSceneRef.current) {
      gameSceneRef.current.character.toggleUmbrella();
      setIsHoldingUmbrella(gameSceneRef.current.character.isHoldingUmbrella);
    }
  };

  const handleToggleWeather = () => {
    if (gameSceneRef.current) {
      const next = gameSceneRef.current.toggleWeather();
      setWeather(next);
      sound.playInteraction();
    }
  };

  const handleTimeOfDayChange = (time: TimeOfDay) => {
    setTimeOfDay(time);
    if (gameSceneRef.current) {
      gameSceneRef.current.setTimeOfDay(time);
      sound.playInteraction();
    }
  };

  const handleCameraModeChange = (mode: CameraMode) => {
    setCameraMode(mode);
    if (gameSceneRef.current) {
      gameSceneRef.current.setCameraMode(mode);
      sound.playInteraction();
    }
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleTriggerEmote = (emote: CharacterAction) => {
    if (gameSceneRef.current) {
      gameSceneRef.current.character.setAction(emote);
    }
  };

  const handleTeleportDistrict = (locId: string) => {
    if (gameSceneRef.current) {
      gameSceneRef.current.teleportToDistrict(locId);
    }
  };

  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMsg: ChatMessage = {
      id: `self_${Date.now()}`,
      sender: 'You (ဧည့်သည်)',
      burmeseSender: 'သင်',
      text,
      time: timeStr,
      isSelf: true,
      avatarColor: '#f59e0b',
    };
    setMessages(prev => [...prev, newMsg]);

    // Simulated warm reply after 1.5 seconds from local residents
    setTimeout(() => {
      const responses = [
        'ဟုတ်ကဲ့ခင်ဗျာ! ပုသိမ်မြို့မှာ ပျော်ရွှင်စွာ လည်ပတ်နိုင်ပါစေ။',
        'ပုသိမ်ဟာလဝါ မင်းမင်းဆိုင်မှာ အခုလေးတင် ဟာလဝါအသစ်ထွက်ထားတယ်နော်!',
        'ရွှေမုဋ္ဌောဘုရားက နေဝင်ချိန်မှာ ရွှေရောင်ဝင်းနေတာ သိပ်ကြည်နူးစရာပဲ။',
        'ပုသိမ်ထီးဆွဲပြီး ကမ်းနားလမ်းမှာ လမ်းလျှောက်တာ အလွန်လှပပါတယ်!',
      ];
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'Pathein Resident (ပုသိမ်သား)',
        burmeseSender: 'ပုသိမ်သူ/သား',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: timeStr,
        avatarColor: '#38bdf8',
      };
      setMessages(p => [...p, botMsg]);
      if (!isChatOpen) {
        setUnreadChatCount(c => c + 1);
      }
    }, 1500);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* Primary HUD Overlay */}
      <HUDOverlay
        currentDistrict={currentDistrict}
        nearInteractive={nearInteractive}
        onTriggerInteractive={handleInteractiveTrigger}
        timeOfDay={timeOfDay}
        onTimeOfDayChange={handleTimeOfDayChange}
        weather={weather}
        onToggleWeather={handleToggleWeather}
        cameraMode={cameraMode}
        onCameraModeChange={handleCameraModeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenChat={() => {
          setIsChatOpen(true);
          setUnreadChatCount(0);
        }}
        onOpenInfo={() => setIsInfoOpen(true)}
        onTriggerEmote={handleTriggerEmote}
        playerPos={playerPos}
        playerYaw={playerYaw}
        onTeleportDistrict={handleTeleportDistrict}
        unreadChatCount={unreadChatCount}
        isHoldingUmbrella={isHoldingUmbrella}
        onToggleUmbrella={handleUmbrellaToggle}
      />

      {/* Mobile Virtual Joystick & Touch Action Buttons */}
      <VirtualJoystick
        onMove={handleVirtualJoystickMove}
        onSprintToggle={setIsSprinting}
        onJump={handleJump}
        onAction={handleInteractiveTrigger}
        onUmbrellaToggle={handleUmbrellaToggle}
        isHoldingUmbrella={isHoldingUmbrella}
        isSprinting={isSprinting}
        nearActionLabel={nearInteractive ? nearInteractive.burmeseActionText : null}
        onCameraRotate={handleMobileCameraRotate}
      />

      {/* Social Chat Modal */}
      <SocialChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendMessage={handleSendMessage}
        messages={messages}
      />

      {/* Pathein Heritage Guide Modal */}
      <PatheinInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
}
