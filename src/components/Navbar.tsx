import React from 'react';
import { SchoolInfo } from '../types';
import {
  Utensils,
  Search,
  AlertTriangle,
  Star,
  MapPin,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentSchool: SchoolInfo;
  onOpenSearch: () => void;
  onOpenAllergens: () => void;
  selectedAllergenCount: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSchool,
  onOpenSearch,
  onOpenAllergens,
  selectedAllergenCount,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* App Title & Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                오늘의 급식
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                NEIS 실시간
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              전국 초·중·고 실시간 식단표 & 알레르기 안심 조회
            </p>
          </div>
        </div>

        {/* Current School Switcher Button */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition group min-w-0"
            title="다른 학교 선택하기"
          >
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {currentSchool.SCHUL_NM}
                </span>
                <span className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200 shrink-0">
                  {currentSchool.SCHUL_KND_SC_NM}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate hidden md:flex">
                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                <span>{currentSchool.LCTN_SC_NM}</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 transition" />
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`p-2 rounded-xl border transition shrink-0 ${
              isBookmarked
                ? 'bg-amber-50 text-amber-500 border-amber-300'
                : 'bg-white text-slate-400 hover:text-slate-600 border-slate-200'
            }`}
            title={isBookmarked ? '즐겨찾기 학교' : '이 학교 즐겨찾기 추가'}
          >
            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Search Modal Trigger (Mobile icon) */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition shrink-0 sm:hidden"
            title="학교 검색"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Allergen Filter Trigger */}
          <button
            type="button"
            onClick={onOpenAllergens}
            className={`flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${
              selectedAllergenCount > 0
                ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
            title="알레르기 유의식품 설정"
          >
            <AlertTriangle
              className={`w-4 h-4 ${
                selectedAllergenCount > 0 ? 'text-rose-500 fill-rose-100' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">알레르기</span>
            {selectedAllergenCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {selectedAllergenCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
