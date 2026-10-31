import React from 'react';
import { X, CheckCircle2, Award, Coins, Flame, ChevronRight, Sparkles, Navigation } from 'lucide-react';
import { DailyTask, PlayerStats } from '../types';
import { sound } from '../audio/soundSystem';

interface DailyTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DailyTask[];
  onClaimReward: (taskId: string) => void;
  onNavigateTask: (locationId: string) => void;
  playerStats: PlayerStats;
}

export const DailyTasksModal: React.FC<DailyTasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onClaimReward,
  onNavigateTask,
  playerStats,
}) => {
  if (!isOpen) return null;

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 select-none pointer-events-auto">
      <div className="relative w-full max-w-lg max-h-[88vh] bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-800 to-amber-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-100 flex items-center gap-1.5">
                <span>နေ့စဉ်တာဝန်များ</span>
                <span className="text-[11px] font-normal text-amber-300">(Daily Quests)</span>
              </h2>
              <p className="text-[10px] text-amber-200/80">
                ပုသိမ်မြို့တော် စူးစမ်းလေ့လာရေး တာဝန်များကို ပြီးမြောက်အောင်လုပ်ပါ
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

        {/* Player Stats Bar & Progress */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
          {/* Level & Kyats */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-amber-300">Lv.{playerStats.level}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-bold text-yellow-300">{playerStats.kyats} ကျပ်</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-cyan-300">{playerStats.meritPoints} ကုသိုလ်</span>
            </div>
          </div>

          {/* Progress fraction */}
          <div className="text-right text-[11px] font-bold text-amber-300">
            {completedCount}/{tasks.length} ပြီးပါပြီ
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.map(task => {
            const isDone = task.isCompleted;
            const isClaimed = task.isClaimed;

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isClaimed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : isDone
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-lg'
                    : 'bg-slate-800/70 border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isClaimed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isDone ? (
                        <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                      <h3 className="text-xs font-bold text-slate-100 leading-snug">
                        {task.burmeseTitle}
                      </h3>
                    </div>
                    <p className="text-[10px] text-slate-400 ml-4 mb-2">{task.description}</p>

                    {/* Reward preview */}
                    <div className="flex items-center gap-2.5 ml-4 text-[10px]">
                      <span className="text-yellow-400 font-semibold flex items-center gap-1">
                        <Coins className="w-3 h-3" /> +{task.rewardKyats} ကျပ်
                      </span>
                      <span className="text-cyan-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> +{task.rewardMerit} ကုသိုလ်
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="shrink-0">
                    {isClaimed ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                        ရယူပြီး (Claimed)
                      </span>
                    ) : isDone ? (
                      <button
                        onClick={() => {
                          onClaimReward(task.id);
                          sound.playCoinReward();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-transform"
                      >
                        ဆုယူမည် (Claim)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onNavigateTask(task.locationId);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-amber-200 text-[10px] font-semibold border border-slate-600 flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <Navigation className="w-3 h-3 text-amber-400" />
                        <span>သွားမည် (Go)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            နေ့စဉ် တာဝန်များကို ပြီးမြောက်ပါက ဆုငွေနှင့် ကုသိုလ်အမှတ်များ ရရှိပါမည်
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>
    </div>
  );
};
