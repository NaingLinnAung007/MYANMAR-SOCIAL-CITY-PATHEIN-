import React, { useEffect, useState } from 'react';
import { Award, Sparkles, X, ChevronRight, Coins, Flame } from 'lucide-react';
import { sound } from '../audio/soundSystem';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  rewardKyats: number;
  rewardMerit: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  rewardKyats,
  rewardMerit,
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      sound.playLevelUpFanfare();

      // Generate 36 celebration sparkles / lotus petals
      const newParticles = Array.from({ length: 36 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.8,
        color: ['#fbbf24', '#f59e0b', '#f43f5e', '#38bdf8', '#34d399', '#e879f9'][i % 6],
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Particle Canvas / Confetti Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full animate-ping"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDuration: `${1.2 + (p.id % 4) * 0.4}s`,
              animationDelay: `${p.delay}s`,
              opacity: 0.85,
            }}
          />
        ))}

        {/* Golden Sunburst Rays */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-[conic-gradient(from_0deg,#f59e0b,#fbbf24,transparent,#f59e0b,transparent,#fbbf24)] animate-spin [animation-duration:20s]" />
        </div>
      </div>

      {/* Main Celebration Card */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 via-amber-950/90 to-slate-950 border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 shadow-2xl text-center transform animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-200 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lotus & Crown Badge */}
        <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 animate-pulse blur-md opacity-75" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-2 border-yellow-200 shadow-xl flex flex-col items-center justify-center rotate-3 transform hover:rotate-0 transition-transform">
            <Award className="w-10 h-10 text-slate-950 drop-shadow" />
            <span className="text-[10px] font-black tracking-widest text-slate-900 uppercase">PATHEIN</span>
          </div>
        </div>

        {/* Celebration Title */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-spin [animation-duration:3s]" />
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 tracking-wide font-sans">
            LEVEL UP!
          </h2>
          <Sparkles className="w-5 h-5 text-yellow-400 animate-spin [animation-duration:3s]" />
        </div>

        <p className="text-base sm:text-lg font-bold text-amber-100 mb-1">
          ဂုဏ်ယူပါတယ်! အဆင့် {newLevel} သို့ တိုးမြှင့်ခံရပါပြီ!
        </p>
        <p className="text-xs text-amber-300/80 mb-6">
          Congratulations! You reached Citizen Level {newLevel} in Pathein City!
        </p>

        {/* Level Stats Badge */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-yellow-500/30 flex items-center gap-3 justify-center">
            <div className="p-2 rounded-xl bg-amber-500/20 text-yellow-400">
              <Coins className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-medium">ဆုကြေးရရှိငွေ</span>
              <span className="text-sm font-bold text-yellow-300">+{rewardKyats} ကျပ်</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex items-center gap-3 justify-center">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-medium">ကုသိုလ်အမှတ်</span>
              <span className="text-sm font-bold text-cyan-300">+{rewardMerit} Merit</span>
            </div>
          </div>
        </div>

        {/* Pathein Citizen Rank Note */}
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs mb-6 leading-relaxed">
          <span>
            သင်သည် ပုသိမ်မြို့တော်၏ ဂုဏ်သရေဆောင် မိတ်ဆွေကောင်းတစ်ဦးအဖြစ် လူမှုအသိုင်းအဝိုင်းတွင် ပိုမိုထင်ရှားလာပါပြီ။
          </span>
        </div>

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>ဆက်လက်ကစားမည် (Continue Exploring)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
