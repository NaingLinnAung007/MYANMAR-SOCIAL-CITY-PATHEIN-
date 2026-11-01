import React, { useState } from 'react';
import {
  X, User, Sparkles, Copy, Check, Dices, Shield,
  Palette, RefreshCw, Award, Heart, CheckCircle2, ChevronRight
} from 'lucide-react';
import { CharacterAppearance, CharacterGender, PlayerStats } from '../types';
import { sound } from '../audio/soundSystem';

interface AccountCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  appearance: CharacterAppearance;
  onUpdateAppearance: (newAppearance: Partial<CharacterAppearance>) => void;
  playerStats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

const LONGYI_COLORS = [
  { name: 'Royal Navy (အပြာရင့်)', color: '#1e3a8a', preview: 'bg-blue-900' },
  { name: 'Golden Amber (ရွှေရောင်)', color: '#d97706', preview: 'bg-amber-600' },
  { name: 'Emerald Jade (မြစိမ်းရောင်)', color: '#047857', preview: 'bg-emerald-700' },
  { name: 'Ruby Maroon (ပတ္တမြားနီ)', color: '#991b1b', preview: 'bg-red-800' },
  { name: 'Royal Purple (ခရမ်းရောင်)', color: '#6b21a8', preview: 'bg-purple-800' },
  { name: 'Delta Rose (ကြာပန်းရောင်)', color: '#db2777', preview: 'bg-pink-600' },
  { name: 'Delta Teal (ရေပြာရောင်)', color: '#0e7490', preview: 'bg-cyan-700' },
  { name: 'Teak Brown (ကျွန်းညိုရောင်)', color: '#451a03', preview: 'bg-amber-950' },
];

const GACHA_PRIZES = [
  { id: 'p1', title: 'ရွှေရောင် ပုသိမ်ထီး (Golden Umbrella)', type: 'item', kyats: 0, rarity: 'SSR' },
  { id: 'p2', title: '၁၀၀ ကျပ်ငွေ Jackpot (100 Kyats)', type: 'currency', kyats: 100, rarity: 'SR' },
  { id: 'p3', title: 'မန္တလေး ရွှေချိတ်လုံချည် (Royal Acheik)', type: 'item', kyats: 0, rarity: 'SSR' },
  { id: 'p4', title: 'ကုသိုလ် အမှတ် ၂၀၀ (200 Merit Points)', type: 'merit', kyats: 0, rarity: 'R' },
  { id: 'p5', title: 'သီရိဧရာ လက်ဖက်ရည်ဆိုင် ဆရာကြီးဘွဲ့ (Tea Shop VIP)', type: 'title', kyats: 0, rarity: 'SR' },
  { id: 'p6', title: '၅၀ ကျပ်ငွေ (50 Kyats)', type: 'currency', kyats: 50, rarity: 'Common' },
];

export const AccountCustomizerModal: React.FC<AccountCustomizerModalProps> = ({
  isOpen,
  onClose,
  appearance,
  onUpdateAppearance,
  playerStats,
  onUpdateStats,
}) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'account' | 'gacha'>('avatar');
  const [copiedCode, setCopiedCode] = useState(false);
  const [nameInput, setNameInput] = useState(appearance.playerName);
  const [inputCode, setInputCode] = useState('');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Gacha rolling state
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<{ title: string; rarity: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appearance.accountCode);
    setCopiedCode(true);
    sound.playInteraction();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateAppearance({ playerName: nameInput.trim() });
      sound.playInteraction();
    }
  };

  const handleRestoreAccount = () => {
    if (inputCode.trim().length >= 6) {
      setSyncMessage('အကောင့်ကုဒ်ဖြင့် အောင်မြင်စွာ ချိတ်ဆက်ပြီးပါပြီ! (Account Synced)');
      sound.playQuestComplete();
      setTimeout(() => setSyncMessage(null), 3000);
    } else {
      setSyncMessage('ကုဒ်နံပါတ် မမှန်ကန်ပါ။ ပြန်လည်စစ်ဆေးပါ။ (Invalid code)');
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  const handleRollGacha = () => {
    if (playerStats.kyats < 20) {
      alert('ကံစမ်းရန် အနည်းဆုံး ၂၀ ကျပ် လိုအပ်ပါသည်! (Need at least 20 Kyats)');
      return;
    }

    // Deduct kyats
    onUpdateStats({
      kyats: playerStats.kyats - 20,
      luckyDrawCount: (playerStats.luckyDrawCount || 0) + 1,
    });

    setIsRolling(true);
    setRollResult(null);
    sound.playLuckyDrawRoll();

    setTimeout(() => {
      const prize = GACHA_PRIZES[Math.floor(Math.random() * GACHA_PRIZES.length)];
      setRollResult(prize);
      setIsRolling(false);
      sound.playLuckyDrawWin();

      if (prize.kyats > 0) {
        onUpdateStats({ kyats: playerStats.kyats - 20 + prize.kyats });
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-200">
                အကောင့် & ဇာတ်ကောင် စိတ်ကြိုက်ပြင်ဆင်ခြင်း
              </h2>
              <p className="text-[11px] text-amber-400/80 font-medium">
                Account, Avatar Outfits & Lucky Draw (တီးဆိုင်ထိုင်မယ် ပုံစံ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('avatar')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'avatar'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>ဇာတ်ကောင်ပုံစံ (Avatar)</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>အကောင့်ကုဒ် (Account Code)</span>
          </button>

          <button
            onClick={() => setActiveTab('gacha')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'gacha'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800/60'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>🎲 ကံစမ်းခြင်း (Lucky Draw)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[62vh] space-y-4">
          {/* TAB 1: AVATAR CUSTOMIZATION */}
          {activeTab === 'avatar' && (
            <div className="space-y-4">
              {/* Player Name Change */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-semibold text-amber-300 block">
                  သင့်နာမည် ပြောင်းလဲရန် (Player Name)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="ဥပမာ: ပုသိမ်သား / မသူဇာ"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                    maxLength={24}
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all cursor-pointer"
                  >
                    သိမ်းဆည်း
                  </button>
                </div>
              </div>

              {/* Gender Selection */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
                <label className="text-xs font-semibold text-amber-300 block">
                  ကျား / မ ရွေးချယ်ခြင်း (Gender Selection)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onUpdateAppearance({ gender: 'male' });
                      sound.playInteraction();
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      appearance.gender === 'male'
                        ? 'bg-blue-600/30 border-blue-400 text-blue-200 shadow-md ring-2 ring-blue-500/50'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span>ကျား (Male / ခေါင်းပေါင်း)</span>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateAppearance({ gender: 'female' });
                      sound.playInteraction();
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      appearance.gender === 'female'
                        ? 'bg-pink-600/30 border-pink-400 text-pink-200 shadow-md ring-2 ring-pink-500/50'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span>မ (Female / ပန်းကုံး)</span>
                  </button>
                </div>
              </div>

              {/* Longyi / Htamein Color Palette */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
                <label className="text-xs font-semibold text-amber-300 block">
                  {appearance.gender === 'male' ? 'လုံချည် အရောင်များ (Men Longyi Colors)' : 'ထဘီ အရောင်များ (Women Htamein Colors)'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LONGYI_COLORS.map(item => (
                    <button
                      key={item.color}
                      onClick={() => {
                        onUpdateAppearance({ longyiColor: item.color });
                        sound.playInteraction();
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        appearance.longyiColor === item.color
                          ? 'border-amber-400 bg-amber-950/40 shadow ring-1 ring-amber-400'
                          : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${item.preview} shrink-0 border border-white/20`} />
                      <span className="text-[10px] font-semibold text-slate-200 truncate">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Myanmar Traditional Props & Cosmetics */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
                <label className="text-xs font-semibold text-amber-300 block">
                  ရိုးရာအသုံးအဆောင် & သနပ်ခါး (Props & Cosmetics)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Thanaka Toggle */}
                  <button
                    onClick={() => {
                      onUpdateAppearance({ hasThanaka: !appearance.hasThanaka });
                      sound.playInteraction();
                    }}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 font-semibold text-xs transition-all cursor-pointer ${
                      appearance.hasThanaka
                        ? 'bg-amber-500/20 border-yellow-400 text-yellow-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>ပါးပြင် သနပ်ခါး</span>
                    <span className="text-[9px] text-amber-400 font-bold">
                      {appearance.hasThanaka ? 'လိမ်းထားသည်' : 'မလိမ်းပါ'}
                    </span>
                  </button>

                  {/* Umbrella Toggle */}
                  <button
                    onClick={() => {
                      onUpdateAppearance({ hasUmbrella: !appearance.hasUmbrella });
                      sound.playInteraction();
                    }}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 font-semibold text-xs transition-all cursor-pointer ${
                      appearance.hasUmbrella
                        ? 'bg-red-500/20 border-red-400 text-red-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>ပုသိမ်ထီး</span>
                    <span className="text-[9px] text-red-400 font-bold">
                      {appearance.hasUmbrella ? 'ကိုင်ထားသည်' : 'မကိုင်ပါ'}
                    </span>
                  </button>

                  {/* Water Gun Toggle */}
                  <button
                    onClick={() => {
                      onUpdateAppearance({ hasWaterGun: !appearance.hasWaterGun });
                      sound.playInteraction();
                    }}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 font-semibold text-xs transition-all cursor-pointer ${
                      appearance.hasWaterGun
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>သကြန် ရေပြွတ်</span>
                    <span className="text-[9px] text-cyan-400 font-bold">
                      {appearance.hasWaterGun ? 'တပ်ဆင်ထား' : 'ဖြုတ်ထား'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACCOUNT CODE & LOGIN */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <Shield className="w-5 h-5" />
                  <h3 className="font-bold text-sm">သင့်ကိုယ်ပိုင် အကောင့်ကုဒ် (Account Code)</h3>
                </div>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  ဤကုဒ်နံပါတ်ဖြင့် အခြားဖုန်း သို့မဟုတ် ကွန်ပျူတာများမှ သင့်ဆော့ကစားထားသော အဆင့်၊ ကျပ်ငွေ၊ နှင့် မိတ်ဆွေစာရင်းများကို အချိန်မရွေး ပြန်လည်ဝင်ရောက်နိုင်ပါသည် (teatalkshop.fun စနစ်)။
                </p>

                <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-400/50 rounded-xl p-3">
                  <span className="font-mono font-bold text-sm sm:text-base text-yellow-300 tracking-wider flex-1">
                    {appearance.accountCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'ကူးယူပြီး' : 'ကုဒ်ကူးမည်'}</span>
                  </button>
                </div>
              </div>

              {/* Restore code on another phone/PC */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-sm text-slate-200">အခြားစက်မှ အကောင့်ကုဒ် ပြန်လည်သွင်းယူရန် (Restore Account)</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    placeholder="ဥပမာ: PTS-7749-AYEYAR"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400 uppercase font-mono"
                  />
                  <button
                    onClick={handleRestoreAccount}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-all cursor-pointer"
                  >
                    ဝင်ရောက်မည်
                  </button>
                </div>
                {syncMessage && (
                  <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{syncMessage}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LUCKY DRAW GACHA */}
          {activeTab === 'gacha' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-950/80 to-purple-950/60 border border-amber-500/40 rounded-2xl p-5 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-yellow-400 mx-auto flex items-center justify-center text-yellow-300 text-2xl shadow-xl animate-pulse">
                  🎲
                </div>
                <h3 className="text-base sm:text-lg font-bold text-amber-200">
                  ပုသိမ် ကံစမ်းမဲ လှည့်ဘီး (Lucky Draw)
                </h3>
                <p className="text-xs text-amber-300/80 max-w-sm mx-auto">
                  လက်ဖက်ရည်ဆိုင် သူဌေးဘွဲ့၊ ရွှေရောင်ထီး၊ အထူးချိတ်လုံချည်များနှင့် ကျပ်ငွေ Jackpot ကံစမ်းနိုင်ပါသည်။
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <span>လက်ကျန်ငွေ: {playerStats.kyats} ကျပ်</span>
                  <span>•</span>
                  <span>လှည့်ခ: ၂၀ ကျပ်</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleRollGacha}
                    disabled={isRolling}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-slate-950 font-black text-sm shadow-xl border-2 border-yellow-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isRolling ? '🎲 ကံစမ်းမဲ လှည့်နေပါသည်...' : '🎲 ၂၀ ကျပ်ဖြင့် ကံစမ်းမည်'}
                  </button>
                </div>

                {rollResult && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-900 border-2 border-yellow-400 text-yellow-200 animate-bounce">
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                      [{rollResult.rarity} ဆုကြီး ပေါက်ပါသည်!]
                    </p>
                    <p className="text-sm font-black text-white mt-1">
                      ✨ {rollResult.title} ✨
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>ဧည့်သည်အကောင့် အဆင့် (Guest Level {playerStats.level})</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer"
          >
            ပြီးပါပြီ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
