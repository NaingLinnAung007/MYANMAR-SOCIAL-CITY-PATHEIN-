import React, { useState } from 'react';
import { X, Coffee, Utensils, Sparkles, Coins, Flame, Check } from 'lucide-react';
import { PlayerStats, TeaMenuItem } from '../types';
import { sound } from '../audio/soundSystem';

interface TeaShopMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerStats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onOrderSuccess: (item: TeaMenuItem) => void;
}

export const TEA_MENU_ITEMS: TeaMenuItem[] = [
  {
    id: 'cho_seint',
    name: 'Cho Seint Milk Tea',
    burmeseName: 'ချိုဆိမ့် လက်ဖက်ရည်',
    priceKyats: 15,
    energyBonus: 25,
    meritBonus: 30,
    description: 'Iconic Myanmar rich & creamy sweet tea in classic transparent glass cup.',
    burmeseDesc: 'နို့စိမ်းနှင့် နို့ဆီအချိုးကျ ဖျော်ထားသော မြန်မာ့ရိုးရာ ချိုဆိမ့် လက်ဖက်ရည်',
    icon: '☕',
  },
  {
    id: 'yay_nway_gyan',
    name: 'Hot Green Tea Thermos',
    burmeseName: 'ရေနွေးကြမ်း ဓာတ်ဘူး',
    priceKyats: 0,
    energyBonus: 15,
    meritBonus: 10,
    description: 'Endless free hot green tea served in vacuum stainless steel thermos.',
    burmeseDesc: 'လက်ဖက်ရည်ဆိုင် စားပွဲတိုင်းတွင် အခမဲ့ သောက်သုံးနိုင်သော ရေနွေးကြမ်းပူပူ',
    icon: '🍵',
  },
  {
    id: 'nan_gyi_thoke',
    name: 'Nan Gyi Thoke Noodle Salad',
    burmeseName: 'နန်းကြီးသုပ်',
    priceKyats: 30,
    energyBonus: 45,
    meritBonus: 50,
    description: 'Thick rice noodles tossed in aromatic chicken curry gravy & crispy split-pea fritters.',
    burmeseDesc: 'ကြက်သားဟင်းအနှစ်၊ ပဲမှုန့်မွှေးမွှေးတို့ဖြင့် သုပ်ထားသော နန်းကြီးသုပ်',
    icon: '🍜',
  },
  {
    id: 'samosa_thoke',
    name: 'Crispy Samosa Thoke',
    burmeseName: 'ဆမူဆာသုပ်',
    priceKyats: 25,
    energyBonus: 35,
    meritBonus: 40,
    description: 'Golden spiced samosas sliced into savoury broth with fresh cabbage and herbs.',
    burmeseDesc: 'ကြွပ်ရွသော ဆမူဆာကြော်ကို အရည်သောက်ဟင်းချို၊ ဂေါ်ဖီတို့ဖြင့် သုပ်ထားသည်',
    icon: '🥟',
  },
  {
    id: 'pathein_halawa',
    name: 'Pathein Royal Halawa',
    burmeseName: 'ပုသိမ်ဟာလဝါ (မင်းမင်းဆိုင်)',
    priceKyats: 35,
    energyBonus: 50,
    meritBonus: 60,
    description: 'Authentic sticky coconut confection toasted with poppy seeds from Min Min store.',
    burmeseDesc: 'အုန်းနို့၊ ဘိန်းစေ့တို့ဖြင့် မွှေးကြိုင်လှသော ပုသိမ်မြို့ ရိုးရာ မင်းမင်း ဟာလဝါ',
    icon: '🍮',
  },
  {
    id: 'e_kya_kway',
    name: 'Golden E-kya-kway',
    burmeseName: 'အီကြာကွေး',
    priceKyats: 15,
    energyBonus: 20,
    meritBonus: 15,
    description: 'Deep-fried golden dough fritter made to dip into hot milky tea.',
    burmeseDesc: 'လက်ဖက်ရည်နှင့် တွဲဖက်နှစ်သောက်ရန် အကောင်းဆုံး ရွှေဝါရောင် အီကြာကွေး',
    icon: '🥖',
  },
];

export const TeaShopMenuModal: React.FC<TeaShopMenuModalProps> = ({
  isOpen,
  onClose,
  playerStats,
  onUpdateStats,
  onOrderSuccess,
}) => {
  const [selectedItem, setSelectedItem] = useState<TeaMenuItem | null>(null);
  const [orderedToast, setOrderedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOrder = (item: TeaMenuItem) => {
    if (playerStats.kyats < item.priceKyats) {
      alert(`ငွေမလုံလောက်ပါ! (Need ${item.priceKyats} Kyats)`);
      return;
    }

    // Deduct kyats and grant bonuses
    onUpdateStats({
      kyats: playerStats.kyats - item.priceKyats,
      energy: Math.min(100, (playerStats.energy || 100) + item.energyBonus),
      meritPoints: playerStats.meritPoints + item.meritBonus,
    });

    sound.playInteraction();
    sound.playCoinReward();

    setOrderedToast(`${item.burmeseName} မှာယူပြီးပါပြီ! (Enjoy!)`);
    onOrderSuccess(item);

    setTimeout(() => {
      setOrderedToast(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-200">
                သီရိဧရာ လက်ဖက်ရည်ဆိုင် မီနူး (Tea Shop Menu)
              </h2>
              <p className="text-[11px] text-amber-400/80 font-medium">
                Authentic Myanmar Tea, Snacks & Halawa
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

        {/* Currency Bar */}
        <div className="px-5 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-yellow-300">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>လက်ကျန်ငွေ: {playerStats.kyats} ကျပ်</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>ခွန်အား (Energy): {playerStats.energy || 100}%</span>
            </div>
          </div>
          <span className="text-[11px] text-amber-400/80">ထိုင်ရင်း စားသောက်ပါ</span>
        </div>

        {/* Toast Alert */}
        {orderedToast && (
          <div className="bg-emerald-600/90 text-white px-4 py-2 text-center text-xs font-bold animate-pulse">
            ✨ {orderedToast} ✨
          </div>
        )}

        {/* Items Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh] grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEA_MENU_ITEMS.map(item => (
            <div
              key={item.id}
              className="bg-slate-800/60 border border-slate-700/80 hover:border-amber-400/60 rounded-xl p-3 flex flex-col justify-between transition-all"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-2xl p-1.5 rounded-lg bg-slate-900 border border-slate-700 shrink-0">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-xs sm:text-sm text-amber-200 truncate">
                      {item.burmeseName}
                    </h3>
                    <span className="text-xs font-black text-yellow-300 whitespace-nowrap">
                      {item.priceKyats === 0 ? 'အခမဲ့ (Free)' : `${item.priceKyats} ကျပ်`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                    {item.burmeseDesc}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-emerald-400 font-semibold">+{item.energyBonus}% စွမ်းအင်</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-semibold">+{item.meritBonus} ကုသိုလ်</span>
                </div>
                <button
                  onClick={() => handleOrder(item)}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow text-xs active:scale-95 transition-all cursor-pointer"
                >
                  မှာယူမည်
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>သီရိဧရာ လက်ဖက်ရည်ဆိုင်နှင့် ပန်းခြံ</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
          >
            ပိတ်မည် (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
