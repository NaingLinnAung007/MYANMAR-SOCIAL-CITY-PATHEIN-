import React, { useEffect, useRef, useState } from 'react';
import { GameScene } from './world/GameScene';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { HUDOverlay } from './ui/HUDOverlay';
import { SocialChatModal } from './ui/SocialChatModal';
import { PatheinInfoModal } from './ui/PatheinInfoModal';
import { DailyTasksModal } from './ui/DailyTasksModal';
import { FriendsModal } from './ui/FriendsModal';
import { PatheinMapModal } from './ui/PatheinMapModal';
import { PhotoModeOverlay } from './ui/PhotoModeOverlay';
import { LevelUpModal } from './ui/LevelUpModal';
import {
  CameraMode, CharacterAction, ChatMessage, DailyTask,
  Friend, InteractiveSpot, LocationInfo, PlayerStats,
  TimeOfDay, WeatherType
} from './types';
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

// Initial Daily Tasks / Quests
const INITIAL_DAILY_TASKS: DailyTask[] = [
  {
    id: 'task_bell',
    title: 'Ring Sacred Pagoda Bell',
    burmeseTitle: 'ရွှေမုဋ္ဌောဘုရား ဖူးမျှော်၍ ခေါင်းလောင်းထိုးပါ',
    description: 'Visit Shwemokhtaw Pagoda and strike the sacred bronze bell for merit.',
    burmeseDesc: 'ရွှေမုဋ္ဌော စေတီတော်မြတ်ကြီးတွင် ကြေးခေါင်းလောင်း သုံးကြိမ်ထိုးပါ',
    targetCount: 1,
    currentCount: 0,
    rewardKyats: 50,
    rewardMerit: 100,
    isCompleted: false,
    isClaimed: false,
    iconName: 'bell',
    locationId: 'shwemokhtaw',
  },
  {
    id: 'task_halawa',
    title: 'Taste Pathein Halawa',
    burmeseTitle: 'ပုသိမ်ဟာလဝါ မင်းမင်းဆိုင်တွင် အရသာမြည်းစမ်းပါ',
    description: 'Enjoy the famous royal delicacy of Pathein in downtown.',
    burmeseDesc: 'ပုသိမ်မြို့လယ် ကုန်သည်လမ်းရှိ မင်းမင်း ဟာလဝါဆိုင်တွင် ဟာလဝါစားပါ',
    targetCount: 1,
    currentCount: 0,
    rewardKyats: 50,
    rewardMerit: 50,
    isCompleted: false,
    isClaimed: false,
    iconName: 'cake',
    locationId: 'downtown',
  },
  {
    id: 'task_umbrella',
    title: 'Equip Pathein Traditional Umbrella',
    burmeseTitle: 'ပုသိမ်ထီး ရိုးရာဈေးတန်းတွင် ထီးဆောင်းလည်ပတ်ပါ',
    description: 'Hold a colorful handmade Pathein umbrella at the market.',
    burmeseDesc: 'ပုသိမ်ထီး ရိုးရာဈေးတန်းသို့ သွားရောက်၍ ထီးကိုင်ဆောင်ပါ',
    targetCount: 1,
    currentCount: 0,
    rewardKyats: 60,
    rewardMerit: 60,
    isCompleted: false,
    isClaimed: false,
    iconName: 'umbrella',
    locationId: 'umbrella_market',
  },
  {
    id: 'task_river_rain',
    title: 'Breathe River Breeze in Rain',
    burmeseTitle: 'မြစ်ကမ်းနားတွင် မိုးဖွဲဖွဲကျနေစဉ် လေညှင်းခံပါ',
    description: 'Experience light tropical delta rain at Pathein Riverfront.',
    burmeseDesc: 'ပုသိမ်မြစ်ကမ်းနားတွင် မိုးဖွဲဖွဲကျဆင်းနေစဉ် ရှုခင်းကြည့်ပါ',
    targetCount: 1,
    currentCount: 0,
    rewardKyats: 80,
    rewardMerit: 70,
    isCompleted: false,
    isClaimed: false,
    iconName: 'rain',
    locationId: 'riverfront',
  },
  {
    id: 'task_tea_chat',
    title: 'Myanmar Tea Shop Gathering',
    burmeseTitle: 'သီရိဧရာ လက်ဖက်ရည်ဆိုင်တွင် စကားစမြည်ပြောပါ',
    description: 'Sit at the round table with thermos tea and chat with friends.',
    burmeseDesc: 'သီရိဧရာ လက်ဖက်ရည်ဆိုင်တွင် ထိုင်၍ မိတ်ဆွေများနှင့် စကားပြောပါ',
    targetCount: 1,
    currentCount: 0,
    rewardKyats: 60,
    rewardMerit: 50,
    isCompleted: false,
    isClaimed: false,
    iconName: 'coffee',
    locationId: 'social_park',
  },
];

// Initial Friends List
const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Thuzar',
    burmeseName: 'မသူဇာ',
    status: 'online',
    currentLocation: 'Shwemokhtaw Pagoda',
    burmeseLocation: 'ရွှေမုဋ္ဌောဘုရား',
    avatarColor: '#ec4899',
    level: 5,
    position: { x: 5, z: 15 },
  },
  {
    id: 'f2',
    name: 'Ko Aung',
    burmeseName: 'ကိုအောင်',
    status: 'online',
    currentLocation: 'Pathein Riverfront',
    burmeseLocation: 'ပုသိမ်မြစ်ကမ်းနား',
    avatarColor: '#3b82f6',
    level: 7,
    position: { x: -20, z: -68 },
  },
  {
    id: 'f3',
    name: 'Min Khant',
    burmeseName: 'မင်းခန့်',
    status: 'online',
    currentLocation: 'Thiri Ayeyar Tea Cafe',
    burmeseLocation: 'သီရိဧရာ လက်ဖက်ရည်ဆိုင်',
    avatarColor: '#f59e0b',
    level: 4,
    position: { x: 47, z: 46 },
  },
  {
    id: 'f4',
    name: 'Daw Hla',
    burmeseName: 'ဒေါ်လှလှ',
    status: 'busy',
    currentLocation: 'Pathein Umbrella Market',
    burmeseLocation: 'ပုသိမ်ထီးဈေးတန်း',
    avatarColor: '#10b981',
    level: 6,
    position: { x: -50, z: 2 },
  },
  {
    id: 'f5',
    name: 'Thiri May',
    burmeseName: 'သီရိမေ',
    status: 'online',
    currentLocation: 'Pathein Downtown',
    burmeseLocation: 'ပုသိမ်မြို့လယ် နာရီစင်',
    avatarColor: '#8b5cf6',
    level: 3,
    position: { x: 35, z: -10 },
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

  // Daily Tasks & Player Stats
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    kyats: 150,
    meritPoints: 200,
    level: 1,
  });

  // Modals & Chat
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isTasksOpen, setIsTasksOpen] = useState<boolean>(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isPhotoMode, setIsPhotoMode] = useState<boolean>(false);
  const [cameraFov, setCameraFov] = useState<number>(55);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    rewardKyats: number;
    rewardMerit: number;
  } | null>(null);
  const [activeDirectFriend, setActiveDirectFriend] = useState<Friend | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  // Player position for minimap tracking
  const [playerPos, setPlayerPos] = useState<{ x: number; z: number }>({ x: 0, z: 18 });
  const [playerYaw, setPlayerYaw] = useState<number>(0);

  // Complete a task helper
  const completeTask = (taskId: string) => {
    setDailyTasks(prev =>
      prev.map(task => {
        if (task.id === taskId && !task.isCompleted) {
          sound.playQuestComplete();
          return { ...task, isCompleted: true, currentCount: 1 };
        }
        return task;
      })
    );
  };

  useEffect(() => {
    if (!canvasMountRef.current) return;

    // Instantiate Three.js game world
    const game = new GameScene(canvasMountRef.current);
    gameSceneRef.current = game;
    game.setTimeOfDay('sunset', true); // Start with the iconic golden sunset immediately
    sound.setDistrictAmbient('shwemokhtaw'); // Start with sacred Shwemokhtaw chanting

    // Wire up proximity listeners
    game.onDistrictChange = loc => {
      setCurrentDistrict(loc);
      if (loc) {
        sound.setDistrictAmbient(loc.id);
      } else {
        sound.stopDistrictAmbient();
      }

      // Check task condition: if raining and player enters riverfront
      if (loc && loc.id === 'riverfront' && gameSceneRef.current?.getWeather() === 'tropical_rain') {
        completeTask('task_river_rain');
      }
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
      // Don't capture when typing in inputs
      if (document.activeElement?.tagName === 'INPUT') return;

      activeKeys[e.code] = true;

      if (e.code === 'KeyE') {
        if (nearInteractive && gameSceneRef.current) {
          gameSceneRef.current.triggerInteraction(nearInteractive);
          checkInteractiveTasks(nearInteractive);
        }
      } else if (e.code === 'KeyU') {
        if (gameSceneRef.current) {
          gameSceneRef.current.character.toggleUmbrella();
          const holding = gameSceneRef.current.character.isHoldingUmbrella;
          setIsHoldingUmbrella(holding);
          if (holding) completeTask('task_umbrella');
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
      sound.stopDistrictAmbient();
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

  const checkInteractiveTasks = (spot: InteractiveSpot) => {
    if (spot.type === 'bell') {
      completeTask('task_bell');
    } else if (spot.type === 'halawa') {
      completeTask('task_halawa');
    } else if (spot.type === 'umbrella') {
      completeTask('task_umbrella');
    } else if (spot.type === 'tea' || spot.type === 'sit') {
      completeTask('task_tea_chat');
    }
  };

  const handleInteractiveTrigger = () => {
    if (nearInteractive && gameSceneRef.current) {
      gameSceneRef.current.triggerInteraction(nearInteractive);
      checkInteractiveTasks(nearInteractive);
    }
  };

  const handleUmbrellaToggle = () => {
    if (gameSceneRef.current) {
      gameSceneRef.current.character.toggleUmbrella();
      const holding = gameSceneRef.current.character.isHoldingUmbrella;
      setIsHoldingUmbrella(holding);
      if (holding) completeTask('task_umbrella');
    }
  };

  const handleToggleWeather = () => {
    if (gameSceneRef.current) {
      const next = gameSceneRef.current.toggleWeather();
      setWeather(next);
      sound.playInteraction();

      if (next === 'tropical_rain' && currentDistrict?.id === 'riverfront') {
        completeTask('task_river_rain');
      }
    }
  };

  const handleTimeOfDayChange = (time: TimeOfDay) => {
    setTimeOfDay(time);
    if (gameSceneRef.current) {
      gameSceneRef.current.setTimeOfDay(time, false); // Cinematic smooth lighting blend
      sound.playWindChimes(); // Sacred Pathein Pagoda spire wind chimes tinkling
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
      sound.setDistrictAmbient(locId);
    }
  };

  // Claim Daily Task Reward with Level Up Check
  const handleClaimReward = (taskId: string) => {
    const targetTask = dailyTasks.find(t => t.id === taskId);
    if (!targetTask || targetTask.isClaimed) return;

    setDailyTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, isClaimed: true } : t))
    );

    sound.playCoinReward();

    setPlayerStats(prev => {
      const newKyats = prev.kyats + targetTask.rewardKyats;
      const newMerit = prev.meritPoints + targetTask.rewardMerit;
      // Calculate level: player starts at lv 1 (200 merit). Each task completed gives 50 merit which triggers a level up!
      const newLevel = Math.max(prev.level, Math.floor((newMerit - 150) / 45) + 1);

      if (newLevel > prev.level) {
        setLevelUpData({
          newLevel,
          rewardKyats: targetTask.rewardKyats,
          rewardMerit: targetTask.rewardMerit,
        });
      }

      return {
        kyats: newKyats,
        meritPoints: newMerit,
        level: newLevel,
      };
    });
  };

  // Photo Mode handlers
  const handleSharePhotoToChat = (photoUrl: string, caption: string, locationName: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const photoMessage: ChatMessage = {
      id: `photo_msg_${Date.now()}`,
      sender: 'Player',
      burmeseSender: 'ကစားသမား',
      text: caption,
      time: timeStr,
      isSelf: true,
      avatarColor: '#f59e0b',
      photoUrl,
      locationName,
    };
    setMessages(prev => [...prev, photoMessage]);
    setUnreadChatCount(c => c + 1);
  };

  const handleSetCameraFov = (fov: number) => {
    setCameraFov(fov);
    if (gameSceneRef.current) {
      gameSceneRef.current.setCameraFov(fov);
    }
  };

  // Friends System Handlers
  const handleAddFriend = (name: string) => {
    const newFriend: Friend = {
      id: `friend_${Date.now()}`,
      name: name,
      burmeseName: name,
      status: 'online',
      currentLocation: currentDistrict ? currentDistrict.englishName : 'Pathein Center',
      burmeseLocation: currentDistrict ? currentDistrict.burmeseName : 'ပုသိမ်မြို့',
      avatarColor: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'][
        Math.floor(Math.random() * 5)
      ],
      level: 1,
      position: { x: playerPos.x + 2, z: playerPos.z + 2 },
    };

    setFriends(prev => [newFriend, ...prev]);

    // Add celebration chat message from newly added friend
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const botMsg: ChatMessage = {
      id: `bot_welcome_${Date.now()}`,
      sender: name,
      burmeseSender: name,
      text: `မင်္ဂလာပါ! ကျွန်တော်/ကျွန်မကို သူငယ်ချင်းအဖြစ် လက်ခံပေးလို့ ကျေးဇူးတင်ပါတယ်ခင်ဗျာ။`,
      time: timeStr,
      avatarColor: newFriend.avatarColor,
    };
    setMessages(prev => [...prev, botMsg]);
    setUnreadChatCount(c => c + 1);
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
    sound.playInteraction();
  };

  const handleOpenDirectChat = (friend: Friend) => {
    setActiveDirectFriend(friend);
    setIsChatOpen(true);
    setUnreadChatCount(0);
  };

  const handleTeleportToFriend = (friend: Friend) => {
    if (gameSceneRef.current) {
      gameSceneRef.current.character.teleport(friend.position.x, friend.position.z + 1.5);
      sound.playInteraction();
    }
  };

  const handleSendMessage = (text: string, recipientId?: string) => {
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
      recipientId,
    };
    setMessages(prev => [...prev, newMsg]);

    // Mark tea chat task complete if talking
    completeTask('task_tea_chat');

    // Simulated reply from recipient or random resident
    setTimeout(() => {
      let responder = activeDirectFriend || friends[0];
      const responses = [
        'ဟုတ်ကဲ့ခင်ဗျာ! ပုသိမ်မြို့မှာ ပျော်ရွှင်စွာ လည်ပတ်နိုင်ပါစေ။',
        'ပုသိမ်ဟာလဝါ မင်းမင်းဆိုင်မှာ အခုလေးတင် ဟာလဝါအသစ်ထွက်ထားတယ်နော်!',
        'ရွှေမုဋ္ဌောဘုရားက နေဝင်ချိန်မှာ ရွှေရောင်ဝင်းနေတာ သိပ်ကြည်နူးစရာပဲ။',
        'ပုသိမ်ထီးဆွဲပြီး ကမ်းနားလမ်းမှာ လမ်းလျှောက်တာ အလွန်လှပပါတယ်!',
        'သီရိဧရာ လက်ဖက်ရည်ဆိုင်မှာ ရေနွေးကြမ်းပူပူလေး သောက်ရအောင်!',
      ];
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: responder.name,
        burmeseSender: responder.burmeseName,
        text: responses[Math.floor(Math.random() * responses.length)],
        time: timeStr,
        avatarColor: responder.avatarColor,
        recipientId,
      };
      setMessages(p => [...p, botMsg]);
      if (!isChatOpen) {
        setUnreadChatCount(c => c + 1);
      }
    }, 1200);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* Primary HUD Overlay - Hidden during Photo Mode */}
      {!isPhotoMode && (
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
          onOpenTasks={() => setIsTasksOpen(true)}
          onOpenFriends={() => setIsFriendsOpen(true)}
          onOpenMap={() => setIsMapOpen(true)}
          onEnterPhotoMode={() => setIsPhotoMode(true)}
          dailyTasks={dailyTasks}
          friends={friends}
          playerStats={playerStats}
          onTriggerEmote={handleTriggerEmote}
          playerPos={playerPos}
          playerYaw={playerYaw}
          onTeleportDistrict={handleTeleportDistrict}
          unreadChatCount={unreadChatCount}
          isHoldingUmbrella={isHoldingUmbrella}
          onToggleUmbrella={handleUmbrellaToggle}
        />
      )}

      {/* Mobile Virtual Joystick & Touch Action Buttons - Hidden during Photo Mode */}
      {!isPhotoMode && (
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
      )}

      {/* Photo Mode Overlay (Full Viewfinder, Filters, Watermark, & In-App Sharing) */}
      <PhotoModeOverlay
        isActive={isPhotoMode}
        onClose={() => setIsPhotoMode(false)}
        currentDistrict={currentDistrict}
        onCaptureScreenshot={() => gameSceneRef.current?.captureScreenshot() || ''}
        onShareToChat={handleSharePhotoToChat}
        onSetCameraFov={handleSetCameraFov}
        currentFov={cameraFov}
      />

      {/* Social Chat Modal with Public & Direct Friends Tabs */}
      <SocialChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendMessage={handleSendMessage}
        messages={messages}
        friends={friends}
        onAddFriend={handleAddFriend}
        activeDirectFriend={activeDirectFriend}
        onSelectDirectFriend={setActiveDirectFriend}
      />

      {/* Daily Tasks / Quests Modal */}
      <DailyTasksModal
        isOpen={isTasksOpen}
        onClose={() => setIsTasksOpen(false)}
        tasks={dailyTasks}
        onClaimReward={handleClaimReward}
        onNavigateTask={handleTeleportDistrict}
        playerStats={playerStats}
      />

      {/* Friends List Modal */}
      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        friends={friends}
        onAddFriend={handleAddFriend}
        onRemoveFriend={handleRemoveFriend}
        onOpenDirectChat={handleOpenDirectChat}
        onTeleportToFriend={handleTeleportToFriend}
      />

      {/* Pathein Heritage Guide Modal */}
      <PatheinInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Interactive Pathein City Map with Quests & Fast Travel Modal */}
      <PatheinMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        playerPos={playerPos}
        playerYaw={playerYaw}
        tasks={dailyTasks}
        onTeleport={handleTeleportDistrict}
        currentDistrictId={currentDistrict?.id}
      />

      {/* Level Up Celebration Animation & Particle Effect */}
      {levelUpData && (
        <LevelUpModal
          isOpen={!!levelUpData}
          onClose={() => setLevelUpData(null)}
          newLevel={levelUpData.newLevel}
          rewardKyats={levelUpData.rewardKyats}
          rewardMerit={levelUpData.rewardMerit}
        />
      )}
    </div>
  );
}
