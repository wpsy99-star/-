import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MealItem, SchoolInfo, ViewMode } from './types';
import { POPULAR_SCHOOLS } from './data/defaultSchools';
import { fetchMealsByRange } from './services/neisApi';
import {
  addDays,
  formatDateToYMD,
  formatDateDisplay,
  getSchoolWeekDays,
  isWeekend,
  isSameDay,
} from './utils/dateUtils';
import { Navbar } from './components/Navbar';
import { DatePickerBar } from './components/DatePickerBar';
import { MealCard } from './components/MealCard';
import { WeeklyMealGrid } from './components/WeeklyMealGrid';
import { SchoolSearchModal } from './components/SchoolSearchModal';
import { AllergenModal } from './components/AllergenModal';
import { NutritionModal } from './components/NutritionModal';
import { OriginModal } from './components/OriginModal';
import { ShareCardModal } from './components/ShareCardModal';
import { SnackChatBot } from './components/SnackChatBot';
import {
  Utensils,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  HelpCircle,
  Eye,
  Info,
  CalendarDays,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const STORAGE_KEYS = {
  SCHOOL: 'school_meal_current_school',
  FAVORITES: 'school_meal_favorites',
  ALLERGENS: 'school_meal_allergens',
  REACTIONS: 'school_meal_reactions',
};

// Fallback sample meal for previewing when a day has no NEIS data (e.g. weekend or vacation)
const SAMPLE_PREVIEW_MEAL: MealItem = {
  mealCode: '2',
  mealName: '중식 (예시 식단)',
  date: 'SAMPLE',
  calories: '895.5 Kcal',
  calorieNumber: 895.5,
  servingCount: 1150,
  dishes: [
    { id: 'sample-1', name: '칼슘기장밥', rawString: '칼슘기장밥', allergenCodes: [] },
    { id: 'sample-2', name: '맑은쇠고기뭇국', rawString: '맑은쇠고기뭇국 (16)', allergenCodes: [16] },
    { id: 'sample-3', name: '수제왕돈까스 & 소스', rawString: '수제왕돈까스 & 소스 (1.2.5.6.10.12.13)', allergenCodes: [1, 2, 5, 6, 10, 12, 13], isPopular: true },
    { id: 'sample-4', name: '마카로니콘샐러드', rawString: '마카로니콘샐러드 (1.5.13)', allergenCodes: [1, 5, 13] },
    { id: 'sample-5', name: '포기김치', rawString: '포기김치 (9)', allergenCodes: [9] },
    { id: 'sample-6', name: '생과일 청포도 & 감귤주스', rawString: '생과일 청포도 & 감귤주스 (13)', allergenCodes: [13], isPopular: true },
  ],
  originInfo: [
    '쇠고기(종류) : 국내산(한우)',
    '돼지고기 : 국내산',
    '쌀 : 국내산',
    '배추 : 국내산',
    '고춧가루 : 국내산',
  ],
  nutritionInfo: [
    { name: '탄수화물', unit: 'g', value: 145.2 },
    { name: '단백질', unit: 'g', value: 38.4 },
    { name: '지방', unit: 'g', value: 21.0 },
    { name: '비타민A', unit: 'R.E', value: 112.5 },
    { name: '비타민C', unit: 'mg', value: 35.0 },
    { name: '칼슘', unit: 'mg', value: 280.0 },
    { name: '철분', unit: 'mg', value: 5.2 },
  ],
};

export default function App() {
  // Current school state with localStorage restoration
  const [currentSchool, setCurrentSchool] = useState<SchoolInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL);
      if (saved) return JSON.parse(saved);
    } catch {}
    return POPULAR_SCHOOLS[0];
  });

  // Favorites list
  const [favorites, setFavorites] = useState<SchoolInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [POPULAR_SCHOOLS[0], POPULAR_SCHOOLS[1]];
  });

  // Selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  // Selected allergens to avoid (array of codes 1~19)
  const [selectedAllergens, setSelectedAllergens] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALLERGENS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // User reactions
  const [userReactions, setUserReactions] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [reactionCounts, setReactionCounts] = useState<
    Record<string, { thumbsUp: number; delicious: number; soso: number; bad: number }>
  >({});

  // Meals data fetched from NEIS
  const [mealsCache, setMealsCache] = useState<Record<string, MealItem[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAllergenOpen, setIsAllergenOpen] = useState(false);
  const [activeNutritionMeal, setActiveNutritionMeal] = useState<MealItem | null>(null);
  const [activeOriginInfo, setActiveOriginInfo] = useState<string[] | null>(null);
  const [activeShareMeal, setActiveShareMeal] = useState<MealItem | null>(null);

  // Preview sample toggle
  const [showSamplePreview, setShowSamplePreview] = useState(false);

  // Save current school to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(currentSchool));
    } catch {}
  }, [currentSchool]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // Save allergens to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALLERGENS, JSON.stringify(selectedAllergens));
    } catch {}
  }, [selectedAllergens]);

  // Save reactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REACTIONS, JSON.stringify(userReactions));
    } catch {}
  }, [userReactions]);

  // Toggle favorite school
  const handleToggleFavorite = (school: SchoolInfo) => {
    setFavorites((prev) => {
      const exists = prev.some((s) => s.SD_SCHUL_CODE === school.SD_SCHUL_CODE);
      if (exists) {
        return prev.filter((s) => s.SD_SCHUL_CODE !== school.SD_SCHUL_CODE);
      }
      return [...prev, school];
    });
  };

  // Toggle allergen
  const handleToggleAllergen = (code: number) => {
    setSelectedAllergens((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleClearAllergens = () => {
    setSelectedAllergens([]);
  };

  // Handle reaction click
  const handleReact = (
    key: string,
    reactionType: 'thumbsUp' | 'delicious' | 'soso' | 'bad'
  ) => {
    const current = userReactions[key];
    const prevCounts = reactionCounts[key] || {
      thumbsUp: 12,
      delicious: 24,
      soso: 3,
      bad: 1,
    };

    if (current === reactionType) {
      // Remove reaction
      const nextCounts = { ...prevCounts, [reactionType]: Math.max(0, prevCounts[reactionType] - 1) };
      setReactionCounts((prev) => ({ ...prev, [key]: nextCounts }));
      setUserReactions((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } else {
      // Add or switch reaction
      const nextCounts = { ...prevCounts };
      if (current) {
        nextCounts[current as keyof typeof nextCounts] = Math.max(
          0,
          nextCounts[current as keyof typeof nextCounts] - 1
        );
      }
      nextCounts[reactionType] = nextCounts[reactionType] + 1;
      setReactionCounts((prev) => ({ ...prev, [key]: nextCounts }));
      setUserReactions((prev) => ({ ...prev, [key]: reactionType }));
    }
  };

  // Compute school week dates (Mon-Fri)
  const weekDays = useMemo(() => getSchoolWeekDays(selectedDate), [selectedDate]);

  // Determine date range to fetch:
  // In day view, we can fetch +/- 3 days or the full week around selectedDate to allow instant navigation
  const fetchRange = useMemo(() => {
    if (viewMode === 'week') {
      const fromYmd = formatDateToYMD(weekDays[0]);
      const toYmd = formatDateToYMD(weekDays[weekDays.length - 1]);
      return { fromYmd, toYmd };
    } else {
      // For day view, fetch from Monday of week to Friday of week so caching is optimal
      const fromYmd = formatDateToYMD(addDays(selectedDate, -3));
      const toYmd = formatDateToYMD(addDays(selectedDate, 3));
      return { fromYmd, toYmd };
    }
  }, [viewMode, selectedDate, weekDays]);

  // Load meals from NEIS
  useEffect(() => {
    let isCancelled = false;

    const loadMeals = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const meals = await fetchMealsByRange(
          currentSchool.ATPT_OFCDC_SC_CODE,
          currentSchool.SD_SCHUL_CODE,
          fetchRange.fromYmd,
          fetchRange.toYmd
        );

        if (!isCancelled) {
          // Group by date
          const grouped: Record<string, MealItem[]> = {};
          meals.forEach((m) => {
            if (!grouped[m.date]) grouped[m.date] = [];
            grouped[m.date].push(m);
          });

          setMealsCache((prev) => ({
            ...prev,
            ...grouped,
          }));
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error(err);
          setErrorMsg('급식 식단 정보를 가져오는데 실패했습니다.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadMeals();

    return () => {
      isCancelled = true;
    };
  }, [currentSchool, fetchRange.fromYmd, fetchRange.toYmd]);

  // Selected day meals
  const selectedYmd = formatDateToYMD(selectedDate);
  const currentDayMeals = mealsCache[selectedYmd] || [];

  const isCurrentWeekend = isWeekend(selectedDate);

  // Jump to nearest school day helper
  const handleJumpToSchoolDay = () => {
    const day = selectedDate.getDay();
    if (day === 6) {
      // Saturday -> jump to Friday
      setSelectedDate(addDays(selectedDate, -1));
    } else if (day === 0) {
      // Sunday -> jump to Monday
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const isBookmarkedCurrent = favorites.some(
    (s) => s.SD_SCHUL_CODE === currentSchool.SD_SCHUL_CODE
  );

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation Bar */}
      <Navbar
        currentSchool={currentSchool}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAllergens={() => setIsAllergenOpen(true)}
        selectedAllergenCount={selectedAllergens.length}
        isBookmarked={isBookmarkedCurrent}
        onToggleBookmark={() => handleToggleFavorite(currentSchool)}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-5 sm:py-6 flex-1 w-full space-y-4 sm:space-y-5">
        {/* Date Selector & View Mode Switcher */}
        <DatePickerBar
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setShowSamplePreview(false);
          }}
          viewMode={viewMode}
          onChangeViewMode={(mode) => setViewMode(mode)}
        />

        {/* Allergen Alert Notification Banner if active allergens configured */}
        {selectedAllergens.length > 0 && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="truncate">
                <span className="font-bold">알레르기 필터 작동중:</span>{' '}
                총 {selectedAllergens.length}개의 식재료가 포함된 메뉴를 자동으로 감지하여 강조합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAllergenOpen(true)}
              className="text-amber-700 hover:text-amber-900 font-bold underline shrink-0"
            >
              설정 변경
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && Object.keys(mealsCache).length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              {currentSchool.SCHUL_NM}의 급식 식단표를 불러오는 중입니다...
            </p>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">급식 정보를 불러올 수 없습니다</p>
              <p className="text-xs text-rose-600 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Week View Mode */}
        {!isLoading && viewMode === 'week' && (
          <WeeklyMealGrid
            weekDays={weekDays}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
            }}
            mealsByDate={mealsCache}
            selectedAllergens={selectedAllergens}
            onOpenDetailedDay={(d) => {
              setSelectedDate(d);
              setViewMode('day');
            }}
          />
        )}

        {/* Day View Mode */}
        {!isLoading && viewMode === 'day' && (
          <>
            {/* If there are meals for current day */}
            {currentDayMeals.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>
                    {currentSchool.SCHUL_NM} · {formatDateDisplay(selectedDate)} 급식
                  </span>
                  <span>총 {currentDayMeals.length}개 식단 제공</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDayMeals.map((meal) => (
                    <MealCard
                      key={`${meal.date}-${meal.mealCode}`}
                      meal={meal}
                      school={currentSchool}
                      selectedDate={selectedDate}
                      selectedAllergens={selectedAllergens}
                      onOpenNutrition={(m) => setActiveNutritionMeal(m)}
                      onOpenOrigin={(origins) => setActiveOriginInfo(origins)}
                      onOpenShare={(m) => setActiveShareMeal(m)}
                      userReactions={userReactions}
                      reactionCounts={reactionCounts}
                      onReact={handleReact}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state when current day has no meals (Weekend or vacation) */}
            {currentDayMeals.length === 0 && !showSamplePreview && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-5 shadow-xs max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  {isCurrentWeekend ? '🏖️' : '🍱'}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-black text-slate-800">
                    {isCurrentWeekend
                      ? '주말에는 급식이 운영되지 않습니다'
                      : '등록된 급식 식단이 없습니다'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                    {isCurrentWeekend
                      ? '평일(월~금) 급식 식단표를 확인하시거나 다른 날짜를 선택해보세요.'
                      : '방학, 재량휴업일, 개교기념일이거나 학교에서 식단을 아직 등록하지 않은 상태일 수 있습니다.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  {isCurrentWeekend ? (
                    <button
                      type="button"
                      onClick={handleJumpToSchoolDay}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        {selectedDate.getDay() === 6 ? '금요일 급식 보기' : '다음 주 월요일 급식 보기'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setViewMode('week')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>이번 주 전체 식단표 보기</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowSamplePreview(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>샘플 식단 미리보기</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sample Preview Card if user triggers sample preview on no-meal day */}
            {currentDayMeals.length === 0 && showSamplePreview && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>
                      <strong>샘플 식단 미리보기 모드:</strong> 실제 기능(알레르기 감지, 영양 분석, 원산지 등)을 테스트해보실 수 있습니다.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSamplePreview(false)}
                    className="text-amber-700 font-bold hover:underline"
                  >
                    미리보기 닫기
                  </button>
                </div>

                <div className="max-w-md mx-auto">
                  <MealCard
                    meal={SAMPLE_PREVIEW_MEAL}
                    school={currentSchool}
                    selectedDate={selectedDate}
                    selectedAllergens={selectedAllergens}
                    onOpenNutrition={(m) => setActiveNutritionMeal(m)}
                    onOpenOrigin={(origins) => setActiveOriginInfo(origins)}
                    onOpenShare={(m) => setActiveShareMeal(m)}
                    userReactions={userReactions}
                    reactionCounts={reactionCounts}
                    onReact={handleReact}
                  />
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">오늘의 급식 · 전국 학교 급식 조회 서비스</p>
          <p className="text-[11px] text-slate-400">
            데이터 출처: 교육부 및 17개 시도교육청 나이스(NEIS) 대국민서비스 오픈API
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SchoolSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSchool={(school) => {
          setCurrentSchool(school);
          setMealsCache({});
        }}
        currentSchool={currentSchool}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />

      <AllergenModal
        isOpen={isAllergenOpen}
        onClose={() => setIsAllergenOpen(false)}
        selectedAllergens={selectedAllergens}
        onToggleAllergen={handleToggleAllergen}
        onClearAll={handleClearAllergens}
      />

      <NutritionModal
        isOpen={!!activeNutritionMeal}
        onClose={() => setActiveNutritionMeal(null)}
        meal={activeNutritionMeal}
        schoolName={currentSchool.SCHUL_NM}
      />

      <OriginModal
        isOpen={!!activeOriginInfo}
        onClose={() => setActiveOriginInfo(null)}
        originInfo={activeOriginInfo || []}
        schoolName={currentSchool.SCHUL_NM}
      />

      <ShareCardModal
        isOpen={!!activeShareMeal}
        onClose={() => setActiveShareMeal(null)}
        meal={activeShareMeal}
        school={currentSchool}
        selectedDate={selectedDate}
      />

      {/* AI Snack Recommendation Chatbot */}
      <SnackChatBot
        currentSchool={currentSchool}
        todaysMeal={currentDayMeals.find((m) => m.mealCode === '2') || currentDayMeals[0] || null}
        selectedAllergens={selectedAllergens}
      />
    </div>
  );
}
