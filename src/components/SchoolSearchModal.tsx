import React, { useState, useEffect, useMemo } from 'react';
import { SchoolInfo } from '../types';
import { EDUCATION_OFFICES, POPULAR_SCHOOLS } from '../data/defaultSchools';
import { searchSchools } from '../services/neisApi';
import {
  X,
  Search,
  Star,
  Building2,
  MapPin,
  Phone,
  Sparkles,
  School,
  Loader2,
  Check,
} from 'lucide-react';

interface SchoolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSchool: (school: SchoolInfo) => void;
  currentSchool: SchoolInfo;
  favorites: SchoolInfo[];
  onToggleFavorite: (school: SchoolInfo) => void;
}

export const SchoolSearchModal: React.FC<SchoolSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSchool,
  currentSchool,
  favorites,
  onToggleFavorite,
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [results, setResults] = useState<SchoolInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Focus and reset on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = keyword.trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const data = await searchSchools(query, selectedRegion || undefined, selectedType || undefined);
      setResults(data);
    } catch (err: any) {
      setErrorMsg('학교 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isFav = (s: SchoolInfo) =>
    favorites.some((f) => f.SD_SCHUL_CODE === s.SD_SCHUL_CODE);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">학교 검색 및 선택</h2>
              <p className="text-xs text-slate-500">전국 시·도 교육청 소속 초·중·고등학교를 검색하세요</p>
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

        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="학교 이름을 입력하세요 (예: 서울고, 경기고, 판교중)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm transition"
                autoFocus
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !keyword.trim()}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-sm rounded-xl transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
            </button>
          </form>

          {/* Filters (Region & Type) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-none focus:border-amber-500"
            >
              {EDUCATION_OFFICES.map((reg) => (
                <option key={reg.code} value={reg.code}>
                  {reg.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              {[
                { label: '전체', val: '' },
                { label: '초등', val: '초등학교' },
                { label: '중학교', val: '중학교' },
                { label: '고등학교', val: '고등학교' },
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => setSelectedType(t.val)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    selectedType === t.val
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Current Search Error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs">전국 교육청 데이터에서 학교를 조회하는 중입니다...</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && hasSearched && results.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 px-1">
                검색 결과 ({results.length}개)
              </div>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
                {results.map((school) => {
                  const isCurrent = currentSchool.SD_SCHUL_CODE === school.SD_SCHUL_CODE;
                  const isBookmarked = isFav(school);

                  return (
                    <div
                      key={school.SD_SCHUL_CODE}
                      className={`p-3.5 flex items-center justify-between hover:bg-slate-50 transition group ${
                        isCurrent ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSchool(school);
                          onClose();
                        }}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">
                            {school.SCHUL_NM}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {school.SCHUL_KND_SC_NM}
                          </span>
                          {school.FOND_SC_NM && (
                            <span className="text-[10px] text-slate-400">
                              {school.FOND_SC_NM}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" /> 현재 선택됨
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                          <span>{school.ORG_RDNMA}</span>
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleFavorite(school)}
                        className={`p-2 rounded-lg transition ml-2 shrink-0 ${
                          isBookmarked
                            ? 'text-amber-500 hover:bg-amber-50'
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                        }`}
                        title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 등록'}
                      >
                        <Star className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results state */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium text-slate-700">
                '{keyword}' 검색 결과가 없습니다.
              </p>
              <p className="text-xs text-slate-500">
                정확한 학교 명칭이나 지역 필터를 확인해보세요. (예: 서울고, 단국대부속고)
              </p>
            </div>
          )}

          {/* Favorites List */}
          {favorites.length > 0 && (!hasSearched || results.length === 0) && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> 내 즐겨찾기 학교
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {favorites.map((s) => (
                  <div
                    key={s.SD_SCHUL_CODE}
                    className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition flex items-center justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSchool(s);
                        onClose();
                      }}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="font-bold text-xs text-slate-800 truncate">
                        {s.SCHUL_NM}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {s.LCTN_SC_NM} · {s.SCHUL_KND_SC_NM}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(s)}
                      className="p-1.5 text-amber-500 hover:text-rose-500 transition"
                      title="즐겨찾기 삭제"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Popular Schools recommendation */}
          {(!hasSearched || results.length === 0) && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 전국 주요 학교 바로보기
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {POPULAR_SCHOOLS.map((s) => {
                  const isCurrent = currentSchool.SD_SCHUL_CODE === s.SD_SCHUL_CODE;
                  return (
                    <button
                      key={s.SD_SCHUL_CODE}
                      type="button"
                      onClick={() => {
                        onSelectSchool(s);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">
                          {s.SCHUL_NM}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {s.LCTN_SC_NM} · {s.SCHUL_KND_SC_NM}
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                          선택중
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>데이터 제공: 교육부 NEIS(나이스) 교육정보 개방포털</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
