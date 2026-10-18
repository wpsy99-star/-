import React from 'react';
import { ALLERGEN_LIST } from '../data/allergens';
import { X, Check, AlertTriangle, RotateCcw } from 'lucide-react';

interface AllergenModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAllergens: number[];
  onToggleAllergen: (code: number) => void;
  onClearAll: () => void;
}

export const AllergenModal: React.FC<AllergenModalProps> = ({
  isOpen,
  onClose,
  selectedAllergens,
  onToggleAllergen,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const selectGroup = (codes: number[]) => {
    // Add all from group that aren't already selected
    codes.forEach((c) => {
      if (!selectedAllergens.includes(c)) {
        onToggleAllergen(c);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                알레르기 유의 식품 설정
                {selectedAllergens.length > 0 && (
                  <span className="text-xs bg-amber-500 text-white font-medium px-2 py-0.5 rounded-full">
                    {selectedAllergens.length}개 선택됨
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                주의해야 할 식재료를 체크하면 식단표에서 강조 표시됩니다 (교육부 19종 표준)
              </p>
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

        {/* Quick presets */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-2 text-xs">
          <span className="text-slate-500 py-1 font-medium">빠른 선택:</span>
          <button
            type="button"
            onClick={() => selectGroup([1, 2])}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 transition"
          >
            🥚🥛 달걀 & 우유
          </button>
          <button
            type="button"
            onClick={() => selectGroup([4, 14, 19])}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 transition"
          >
            🥜🌰 견과류
          </button>
          <button
            type="button"
            onClick={() => selectGroup([8, 9, 17, 18])}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 transition"
          >
            🦐🦀 갑각류/패류
          </button>
          <button
            type="button"
            onClick={() => selectGroup([3, 5, 6])}
            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 transition"
          >
            🌾🍞 밀 & 대두
          </button>
          {selectedAllergens.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="ml-auto px-2.5 py-1 rounded-md text-rose-600 hover:bg-rose-50 flex items-center gap-1 font-medium transition"
            >
              <RotateCcw className="w-3 h-3" /> 초기화
            </button>
          )}
        </div>

        {/* 19 Allergens Grid */}
        <div className="p-5 overflow-y-auto space-y-2 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ALLERGEN_LIST.map((item) => {
              const isChecked = selectedAllergens.includes(item.code);
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onToggleAllergen(item.code)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                    isChecked
                      ? 'bg-amber-50/80 border-amber-400 shadow-xs ring-1 ring-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold transition ${
                      isChecked
                        ? 'bg-amber-500 text-white'
                        : 'border border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-400">
                        {item.code}번
                      </span>
                      <span
                        className={`text-sm font-semibold truncate ${
                          isChecked ? 'text-amber-900' : 'text-slate-800'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            설정한 알레르기는 브라우저에 안전하게 저장됩니다.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition shadow-sm"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};
