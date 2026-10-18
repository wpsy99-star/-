import React, { useState } from 'react';
import { MealItem, SchoolInfo } from '../types';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { formatDateDisplay } from '../utils/dateUtils';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: MealItem | null;
  school: SchoolInfo;
  selectedDate: Date;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  meal,
  school,
  selectedDate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !meal) return null;

  const dateStr = formatDateDisplay(selectedDate);
  const dishLines = meal.dishes.map((d) => `• ${d.name}`).join('\n');

  const shareText = `🍱 [${school.SCHUL_NM} 급식 알림]
📅 ${dateStr} (${meal.mealName})
🔥 열량: ${meal.calories || '미표기'}

[오늘의 메뉴]
${dishLines}

조회: 오늘의 급식 앱`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-violet-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">식단 공유하기</h2>
              <p className="text-xs text-slate-500 mt-0.5">카카오톡이나 문자로 친구에게 전송해보세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs whitespace-pre-wrap text-slate-700 leading-relaxed max-h-60 overflow-y-auto">
            {shareText}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" /> 클립보드에 복사되었습니다!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> 텍스트 전체 복사하기
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
