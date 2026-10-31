import React from 'react';
import { X, BookOpen, MapPin, Sparkles, Heart } from 'lucide-react';

interface PatheinInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatheinInfoModal: React.FC<PatheinInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 select-none pointer-events-auto">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-800 to-amber-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-100">
                ပုသိမ်မြို့တော် သမိုင်းနှင့် ယဉ်ကျေးမှု
              </h2>
              <p className="text-xs text-amber-300">
                Pathein City Heritage Guide – Ayeyarwady Region, Myanmar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/30 text-amber-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200 text-sm leading-relaxed">
          {/* Section 1: Shwemokhtaw Pagoda */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold">
              <MapPin className="w-4 h-4" />
              <h3 className="text-sm">ရွှေမုဋ္ဌော စေတီတော်မြတ်ကြီး (Shwemokhtaw Pagoda)</h3>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Shwemokhtaw Pagoda stands on the highest hill in Pathein as the paramount Buddhist monument of the Ayeyarwady Delta. Legend records that Emperor Asoka of India originally consecrated relics here in 305 BC. It was subsequently elevated and adorned by Myanmar kings Alaungsithu (1115 AD) and Narapatisithu, crowned by a majestic golden Hti finial encrusted with rubies and sapphires.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-300/80 italic">
              <Sparkles className="w-3.5 h-3.5" />
              <span>In-game tip: Visit the courtyard and ring the sacred bronze bell for merit!</span>
            </div>
          </div>

          {/* Section 2: Pathein Umbrella */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm">ပုသိမ်ထီး ရိုးရာလက်မှုအနုပညာ (Pathein Traditional Umbrella)</h3>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Pathein umbrellas (ပုသိမ်ထီး) are world-renowned cultural symbols of Myanmar. Handcrafted entirely from natural delta materials: flexible bamboo stems, thanaphi wood stems, raw handwoven cotton or silk fabrics, and water-repellent persimmon resin. Master artists paint intricate lotus flowers, peacocks, and traditional floral spirals on each umbrella by hand.
            </p>
            <div className="text-[11px] text-amber-300/80 italic">
              <span>Press the Umbrella button in your HUD to hold and display a colorful Pathein umbrella.</span>
            </div>
          </div>

          {/* Section 3: Pathein Riverfront */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold">
              <MapPin className="w-4 h-4" />
              <h3 className="text-sm">ပုသိမ်မြစ်ကမ်းနား (Pathein Riverfront Promenade)</h3>
            </div>
            <p className="text-xs text-slate-300">
              Flowing into the Andaman Sea, the Pathein River has been an indispensable commercial lifeline of the delta for centuries. At sunset, the riverfront transforms into the city’s favorite social promenade where families walk along the breeze, watching wooden sampan ferry boats and cargo barges glide across golden water reflections.
            </p>
          </div>

          {/* Section 4: Pathein Halawa */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm">ပုသိမ်ဟာလဝါ (Pathein Halawa Confectionery)</h3>
            </div>
            <p className="text-xs text-slate-300">
              No trip to Pathein is complete without tasting Pathein Halawa (ပုသိမ်ဟာလဝါ). This signature dessert is slowly caramelized over wood embers with sticky glutinous rice flour, fresh coconut cream, golden butter, sugar, and crunchy toasted white poppy seeds.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            နားလည်ပါပြီ (Close Guide)
          </button>
        </div>
      </div>
    </div>
  );
};
