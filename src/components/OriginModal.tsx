import React from 'react';
import { X, MapPin } from 'lucide-react';

interface OriginModalProps {
  isOpen: boolean;
  onClose: () => void;
  originInfo: string[];
  schoolName: string;
}

export const OriginModal: React.FC<OriginModalProps> = ({
  isOpen,
  onClose,
  originInfo,
  schoolName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">식재료 원산지 정보</h2>
              <p className="text-xs text-slate-500 mt-0.5">{schoolName}</p>
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

        <div className="p-5 overflow-y-auto space-y-2 flex-1">
          {originInfo.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              등록된 원산지 정보가 없습니다.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/40">
              {originInfo.map((line, idx) => {
                const parts = line.split(':');
                const title = parts[0]?.trim();
                const place = parts.slice(1).join(':').trim();

                const isDomestic = place.includes('국내산') || place.includes('한우') || place.includes('육우');

                return (
                  <div key={idx} className="p-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{title}</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        isDomestic
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {place || '표기없음'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
