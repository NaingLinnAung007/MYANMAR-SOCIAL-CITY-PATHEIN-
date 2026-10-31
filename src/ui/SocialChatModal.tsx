import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Users, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { sound } from '../audio/soundSystem';

interface SocialChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (msg: string) => void;
  messages: ChatMessage[];
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
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    onSendMessage(text);
    sound.playInteraction();
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 select-none pointer-events-auto">
      <div className="relative w-full max-w-lg h-[540px] max-h-[90vh] bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-700/80 to-amber-900/90 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-100 flex items-center gap-1.5">
                <span>ပုသိမ် လူမှုစကားဝိုင်း</span>
                <span className="text-[11px] font-normal text-amber-300">(Pathein City Chat)</span>
              </h2>
              <p className="text-[10px] text-amber-200/80">Connect & chat with local Pathein friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/30 text-amber-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
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
              </div>
              <div
                className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.isSelf
                    ? 'bg-amber-600 text-amber-50 rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
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
            placeholder="Type message in Burmese or English..."
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
