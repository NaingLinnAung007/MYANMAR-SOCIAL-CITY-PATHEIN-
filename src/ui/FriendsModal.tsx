import React, { useState } from 'react';
import { X, Users, UserPlus, MessageCircle, Navigation, Search, Check, Trash2 } from 'lucide-react';
import { Friend } from '../types';
import { sound } from '../audio/soundSystem';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  onAddFriend: (name: string) => void;
  onRemoveFriend: (friendId: string) => void;
  onOpenDirectChat: (friend: Friend) => void;
  onTeleportToFriend: (friend: Friend) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  friends,
  onAddFriend,
  onRemoveFriend,
  onOpenDirectChat,
  onTeleportToFriend,
}) => {
  const [newFriendName, setNewFriendName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    onAddFriend(newFriendName.trim());
    setNewFriendName('');
    sound.playInteraction();
  };

  const filteredFriends = friends.filter(
    f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.burmeseName.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 select-none pointer-events-auto">
      <div className="relative w-full max-w-lg max-h-[88vh] bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-800 to-amber-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-100 flex items-center gap-1.5">
                <span>ပုသိမ် သူငယ်ချင်းများ</span>
                <span className="text-[11px] font-normal text-amber-300">(Friends List)</span>
              </h2>
              <p className="text-[10px] text-amber-200/80">
                မိတ်ဆွေဖွဲ့ခြင်း၊ စကားပြောခြင်းနှင့် အတူတူ လည်ပတ်ခြင်း
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

        {/* Add Friend Form */}
        <form onSubmit={handleAddSubmit} className="p-3 bg-slate-950/90 border-b border-slate-800 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newFriendName}
              onChange={e => setNewFriendName(e.target.value)}
              placeholder="သူငယ်ချင်းအမည် ရိုက်ထည့်ပါ (Add Friend Name)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add မည်</span>
          </button>
        </form>

        {/* Search Bar */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="သူငယ်ချင်းများ ရှာဖွေပါ (Search)..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <span className="text-[11px] text-amber-300/80 font-semibold">
            {friends.length} ယောက်
          </span>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              သူငယ်ချင်း မတွေ့သေးပါ။ အထက်ပါ box တွင် အမည်ထည့်၍ Add နိုင်ပါသည်။
            </div>
          ) : (
            filteredFriends.map(friend => (
              <div
                key={friend.id}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/40 flex items-center justify-between gap-3 transition-colors"
              >
                {/* Avatar and Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
                      style={{ backgroundColor: friend.avatarColor }}
                    >
                      {friend.burmeseName.charAt(0) || friend.name.charAt(0)}
                    </div>
                    {/* Status dot */}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${
                        friend.status === 'online'
                          ? 'bg-emerald-500'
                          : friend.status === 'busy'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-slate-100 truncate">
                        {friend.burmeseName}
                      </h3>
                      <span className="text-[10px] text-slate-400 truncate">({friend.name})</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-700 text-amber-300 text-[9px] font-semibold">
                        Lv.{friend.level}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-400/90 truncate flex items-center gap-1 mt-0.5">
                      <span>📍</span> {friend.burmeseLocation}
                    </p>
                  </div>
                </div>

                {/* Actions: Direct Chat & Teleport to Friend */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onOpenDirectChat(friend);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-slate-700/80 hover:bg-amber-600 text-amber-200 hover:text-white border border-slate-600 active:scale-95 transition-all"
                    title={`Chat with ${friend.burmeseName}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onTeleportToFriend(friend);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-transform"
                    title={`Teleport to ${friend.burmeseLocation}`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">သွားမည်</span>
                  </button>

                  <button
                    onClick={() => onRemoveFriend(friend.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove Friend"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            သူငယ်ချင်းအနားသို့ တိုက်ရိုက်သွားရောက်လည်ပတ်နိုင်ပါသည်
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
