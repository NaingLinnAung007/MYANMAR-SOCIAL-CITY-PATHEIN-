import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Users, Sparkles, UserPlus, MessageCircle, Camera } from 'lucide-react';
import { ChatMessage, Friend } from '../types';
import { sound } from '../audio/soundSystem';

interface SocialChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (msg: string, recipientId?: string) => void;
  messages: ChatMessage[];
  friends: Friend[];
  onAddFriend: (name: string) => void;
  activeDirectFriend: Friend | null;
  onSelectDirectFriend: (friend: Friend | null) => void;
}

const BURMESE_QUICK_PHRASES = [
  'မင်္ဂလာပါ ခင်ဗျာ! (Mingalaba!)',
  'ပုသိမ်ဟာလဝါ စားကြမလား? (Shall we eat Halawa?)',
  'ရွှေမုဋ္ဌောဘုရားမှာ တွေ့ကြမယ် (Meet at Shwemokhtaw)',
  'ဆည်းဆာချိန် မြစ်ကမ်းနား လမ်းလျှောက်ကြစို့ (Walk at Riverfront)',
  'လက်ဖက်ရည်ဆိုင်မှာ ရေနွေးကြမ်းသောက်ရင်း စကားပြောကြမယ် (Tea shop chat)',
];

export const SocialChatModal: React.FC<SocialChatModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  messages,
  friends,
  onAddFriend,
  activeDirectFriend,
  onSelectDirectFriend,
}) => {
  const [inputText, setInputText] = useState('');
  const [chatTab, setChatTab] = useState<'public' | 'direct'>('public');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeDirectFriend) {
      setChatTab('direct');
    }
  }, [activeDirectFriend]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, chatTab]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    const recipientId = chatTab === 'direct' && activeDirectFriend ? activeDirectFriend.id : undefined;
    onSendMessage(text, recipientId);
    sound.playInteraction();
    setInputText('');
  };

  // Filter messages based on active tab
  const displayedMessages = messages.filter(msg => {
    if (chatTab === 'public') {
      return !msg.recipientId;
    } else {
      if (!activeDirectFriend) return false;
      return (
        (msg.recipientId === activeDirectFriend.id && msg.isSelf) ||
        (msg.sender.toLowerCase().includes(activeDirectFriend.name.toLowerCase()) ||
         msg.burmeseSender === activeDirectFriend.burmeseName)
      );
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 select-none pointer-events-auto">
      <div className="relative w-full max-w-lg h-[540px] max-h-[90vh] bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-800 to-amber-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-100 flex items-center gap-1.5">
                <span>ပုသိမ် စကားဝိုင်း</span>
                <span className="text-[11px] font-normal text-amber-300">
                  {chatTab === 'public' ? '(City Chat)' : `(DM: ${activeDirectFriend?.burmeseName || 'Friend'})`}
                </span>
              </h2>
              <p className="text-[10px] text-amber-200/80">
                {chatTab === 'public'
                  ? 'ပုသိမ်မြို့တော် အများသုံး စကားဝိုင်း'
                  : `${activeDirectFriend?.burmeseName || 'သူငယ်ချင်း'} နှင့် သီးသန့်စကားပြောဆိုခြင်း`}
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

        {/* Tab Switcher: City Public Chat vs Direct Friends Chat */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => {
                setChatTab('public');
                onSelectDirectFriend(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                chatTab === 'public'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>မြို့တော် စကားဝိုင်း</span>
            </button>
            <button
              onClick={() => {
                setChatTab('direct');
                if (!activeDirectFriend && friends.length > 0) {
                  onSelectDirectFriend(friends[0]);
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                chatTab === 'direct'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>သူငယ်ချင်း သီးသန့်</span>
            </button>
          </div>

          {chatTab === 'direct' && friends.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[200px]">
              {friends.map(f => (
                <button
                  key={f.id}
                  onClick={() => onSelectDirectFriend(f)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap border transition-all ${
                    activeDirectFriend?.id === f.id
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {f.burmeseName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {chatTab === 'direct'
                ? `${activeDirectFriend?.burmeseName || 'သူငယ်ချင်း'} ထံ စကားစတင်ပြောဆိုလိုက်ပါ!`
                : 'မက်ဆေ့ခ်ျ မရှိသေးပါ။ မင်္ဂလာပါဟု နှုတ်ဆက်လိုက်ပါ!'}
            </div>
          ) : (
            displayedMessages.map(msg => {
              const isFriend = friends.some(
                f => f.name.toLowerCase() === msg.sender.toLowerCase() || f.burmeseName === msg.burmeseSender
              );

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: msg.avatarColor }}
                    />
                    <span className="font-semibold text-slate-200">
                      {msg.burmeseSender ? `${msg.burmeseSender} (${msg.sender})` : msg.sender}
                    </span>
                    <span className="text-[10px] opacity-70">{msg.time}</span>

                    {/* Quick Add Friend button if sender is not yourself and not in friends list */}
                    {!msg.isSelf && !isFriend && (
                      <button
                        onClick={() => onAddFriend(msg.burmeseSender || msg.sender)}
                        className="ml-1 px-1.5 py-0.2 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[9px] font-semibold border border-amber-500/40 flex items-center gap-0.5 transition-colors"
                        title="Add Friend"
                      >
                        <UserPlus className="w-2.5 h-2.5" />
                        <span>+Add</span>
                      </button>
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.isSelf
                        ? 'bg-amber-600 text-amber-50 rounded-tr-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.photoUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-yellow-400/40 bg-black/60 shadow-lg">
                        <img
                          src={msg.photoUrl}
                          alt="Pathein City View"
                          className="w-full max-h-48 object-cover rounded-lg"
                        />
                        {msg.locationName && (
                          <div className="px-2 py-1 bg-slate-950/90 text-[10px] text-amber-300 font-semibold flex items-center gap-1 border-t border-slate-800">
                            <Camera className="w-3 h-3 text-amber-400" />
                            <span>{msg.locationName}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div>{msg.text}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Burmese Chat Buttons */}
        <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
          {BURMESE_QUICK_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(phrase)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-amber-700/60 text-slate-200 hover:text-yellow-200 text-[11px] whitespace-nowrap border border-slate-700 transition-colors shrink-0"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Text Input Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={
              chatTab === 'direct' && activeDirectFriend
                ? `${activeDirectFriend.burmeseName} ထံ မက်ဆေ့ခ်ျပို့ပါ...`
                : 'စကားပြောရန် စာရိုက်ပါ (Burmese or English)...'
            }
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-transform active:scale-95"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
