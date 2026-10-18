import React, { useState, useRef, useEffect } from 'react';
import { MealItem, SchoolInfo } from '../types';
import { ALLERGEN_MAP } from '../data/allergens';
import {
  Sparkles,
  MessageCircle,
  X,
  Send,
  Loader2,
  RotateCcw,
  Bot,
  Cookie,
  Flame,
  ChevronDown,
  Minimize2,
  Maximize2,
  AlertTriangle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface SnackChatBotProps {
  currentSchool: SchoolInfo;
  todaysMeal: MealItem | null;
  selectedAllergens: number[];
}

const QUICK_PROMPTS = [
  '🔥 매운 급식 뒤 달콤 디저트 추천해줘',
  '🏪 하교길 편의점 꿀조합 간식 알려줘',
  '⚡ 시험기간 졸음 깨는 집중력 간식',
  '🥗 칼로리 낮은 다이어트 건강 간식',
  '🥤 상큼하고 시원한 음료 간식',
];

export const SnackChatBot: React.FC<SnackChatBotProps> = ({
  currentSchool,
  todaysMeal,
  selectedAllergens,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `안녕! 나는 오늘 급식 맞춤 간식 큐레이터 **'냠냠이'**야! 🍪✨

오늘 먹은 급식 메뉴와 칼로리, 알레르기에 딱 맞춘 센스 만점 간식을 추천해줄게. 궁금한 간식이 있거나 편의점/분식 꿀조합이 필요하면 언제든 물어봐!`,
      time: '지금',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Build meal context summary
  const mealContextString = todaysMeal
    ? `${currentSchool.SCHUL_NM} ${todaysMeal.mealName} (열량: ${todaysMeal.calories || '미표기'}), 메뉴: ${todaysMeal.dishes.map((d) => d.name).join(', ')}`
    : `${currentSchool.SCHUL_NM} 급식`;

  const avoidedNames = selectedAllergens
    .map((code) => ALLERGEN_MAP.get(code)?.name || `${code}번`)
    .join(', ');

  const handleSend = async (userPrompt?: string) => {
    const textToSend = (userPrompt || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'bot' ? 'model' : 'user',
        text: m.text,
      }));

      const res = await fetch('/api/snack-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          mealContext: mealContextString,
          avoidedAllergens: avoidedNames,
        }),
      });

      const data = await res.json();
      const botResponseText = data.text || '맛있는 간식을 찾는데 잠시 문제가 생겼어요. 다시 물어봐줘!';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: '일시적인 네트워크 문제로 답변을 가져오지 못했어요. 잠시 후 다시 질문해줘! 🥺',
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `대화가 초기화되었어! 오늘 ${currentSchool.SCHUL_NM} 급식과 어울리는 다른 간식도 편하게 물어봐줘! 🧃`,
        time: '지금',
      },
    ]);
  };

  // Helper to format bot markdown text cleanly
  const renderFormattedText = (raw: string) => {
    return raw.split('\n').map((line, i) => {
      // Bold handling **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);

      return (
        <span key={i} className="block leading-relaxed min-h-[1.25rem]">
          {parts.map((p, idx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return (
                <strong key={idx} className="font-bold text-slate-900">
                  {p.slice(2, -2)}
                </strong>
              );
            }
            if (p.startsWith('*') && p.endsWith('*')) {
              return (
                <em key={idx} className="italic text-slate-500">
                  {p.slice(1, -1)}
                </em>
              );
            }
            return p;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group animate-fade-in">
          {/* Tooltip bubble on hover / initial view */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-2xl shadow-lg border border-amber-200">
            <span className="text-amber-500">✨</span>
            <span>오늘 급식 뒤 뭐 먹지? 간식 추천!</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95"
            title="간식 추천 챗봇 열기"
          >
            <div className="relative">
              <Cookie className="w-5 h-5 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
            </div>
            <span className="font-bold text-sm">간식 챗봇</span>
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-fade-in">
          {/* Chat Window Header */}
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
                🍪
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight">간식 요정 냠냠이</h3>
                  <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded-md font-semibold">
                    AI 챗봇
                  </span>
                </div>
                <p className="text-[11px] text-amber-100 flex items-center gap-1">
                  <span>{currentSchool.SCHUL_NM} 급식 연계</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                title="대화 초기화"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Context pill banner */}
          <div className="px-3.5 py-2 bg-amber-50/90 border-b border-amber-100 text-xs text-amber-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">
                {todaysMeal
                  ? `오늘 식단: ${todaysMeal.dishes.map((d) => d.name).slice(0, 3).join(', ')}...`
                  : '오늘의 급식을 분석하여 최적의 간식을 추천합니다'}
              </span>
            </div>
            {selectedAllergens.length > 0 && (
              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> 알레르기 제외
              </span>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm shrink-0 mt-0.5">
                    🍪
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-amber-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm shrink-0">
                  🍪
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  <span>냠냠이가 꿀조합 간식을 고민하고 있어요... 💭</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 border border-slate-200 text-[11px] text-slate-600 transition shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="예: 오늘 점심 매웠는데 어울리는 디저트는?"
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center shadow-xs transition shrink-0"
              title="메시지 전송"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
