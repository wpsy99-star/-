import React, { useState } from 'react';
import { MealItem, SchoolInfo } from '../types';
import { ALLERGEN_MAP } from '../data/allergens';
import {
  Flame,
  Activity,
  MapPin,
  Share2,
  Sparkles,
  AlertTriangle,
  Info,
  ThumbsUp,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';

interface MealCardProps {
  meal: MealItem;
  school: SchoolInfo;
  selectedDate: Date;
  selectedAllergens: number[];
  onOpenNutrition: (meal: MealItem) => void;
  onOpenOrigin: (originInfo: string[]) => void;
  onOpenShare: (meal: MealItem) => void;
  userReactions: Record<string, string>;
  reactionCounts: Record<string, { thumbsUp: number; delicious: number; soso: number; bad: number }>;
  onReact: (key: string, reactionType: 'thumbsUp' | 'delicious' | 'soso' | 'bad') => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  school,
  selectedDate,
  selectedAllergens,
  onOpenNutrition,
  onOpenOrigin,
  onOpenShare,
  userReactions,
  reactionCounts,
  onReact,
}) => {
  const [activeDishId, setActiveDishId] = useState<string | null>(null);

  const mealKey = `${school.SD_SCHUL_CODE}_${meal.date}_${meal.mealCode}`;
  const myReaction = userReactions[mealKey];
  const counts = reactionCounts[mealKey] || {
    thumbsUp: 14,
    delicious: 28,
    soso: 4,
    bad: 1,
  };

  const getMealHeaderColor = () => {
    switch (meal.mealCode) {
      case '1':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
          icon: '🌅',
        };
      case '3':
        return {
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
          icon: '🌙',
        };
      default: // '2' 중식
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
          icon: '☀️',
        };
    }
  };

  const styleConfig = getMealHeaderColor();

  // Check if any dish contains user's avoided allergen
  const mealHasAvoidedAllergen = meal.dishes.some((d) =>
    d.allergenCodes.some((code) => selectedAllergens.includes(code))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition hover:border-slate-300">
      {/* Meal Card Header */}
      <div className={`p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r ${styleConfig.gradient} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{styleConfig.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {meal.mealName}
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${styleConfig.badge}`}>
                {meal.mealCode === '1' ? '아침' : meal.mealCode === '2' ? '점심' : '저녁'}
              </span>
            </div>
            {meal.servingCount && (
              <span className="text-[11px] text-slate-500">
                약 {meal.servingCount.toLocaleString()}인분 조리
              </span>
            )}
          </div>
        </div>

        {/* Calories & Warnings */}
        <div className="flex items-center gap-2">
          {mealHasAvoidedAllergen && (
            <span
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 animate-pulse"
              title="설정한 알레르기 식품이 포함되어 있습니다"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>알레르기 주의</span>
            </span>
          )}

          {meal.calories && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-800">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
              <span className="font-bold text-xs sm:text-sm">{meal.calories}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dishes List */}
      <div className="p-4 sm:p-5 space-y-2 flex-1">
        <div className="space-y-1.5">
          {meal.dishes.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">등록된 메뉴가 없습니다.</p>
          ) : (
            meal.dishes.map((dish) => {
              // Allergen matches
              const matchedAvoided = dish.allergenCodes.filter((c) =>
                selectedAllergens.includes(c)
              );
              const isAvoided = matchedAvoided.length > 0;
              const isDetailsOpen = activeDishId === dish.id;

              return (
                <div
                  key={dish.id}
                  className={`p-3 rounded-xl border transition ${
                    isAvoided
                      ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                      : 'bg-slate-50/70 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold text-slate-800 truncate">
                        {dish.name}
                      </span>

                      {dish.isPopular && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                          <Sparkles className="w-3 h-3 text-amber-500" /> 인기
                        </span>
                      )}

                      {isAvoided && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                          {matchedAvoided
                            .map((code) => ALLERGEN_MAP.get(code)?.name.split('(')[0] || code)
                            .join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Allergen code info toggle */}
                    {dish.allergenCodes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveDishId(isDetailsOpen ? null : dish.id)}
                        className="text-[11px] text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-200/50 transition shrink-0"
                        title="알레르기 성분 정보"
                      >
                        알레르기 {dish.allergenCodes.length}종
                      </button>
                    )}
                  </div>

                  {/* Expandable allergen pills for this dish */}
                  {isDetailsOpen && dish.allergenCodes.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5 text-xs animate-fade-in">
                      {dish.allergenCodes.map((code) => {
                        const meta = ALLERGEN_MAP.get(code);
                        const isWarn = selectedAllergens.includes(code);
                        return (
                          <span
                            key={code}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                              isWarn
                                ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{meta?.icon || '•'}</span>
                            <span>{meta?.name || `${code}번`}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Buttons: Nutrition, Origin, Share */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenNutrition(meal)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700 font-medium transition"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>영양 성분</span>
          </button>

          {meal.originInfo.length > 0 && (
            <button
              type="button"
              onClick={() => onOpenOrigin(meal.originInfo)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-700 font-medium transition"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>원산지</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenShare(meal)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:text-amber-700 font-medium transition"
        >
          <Share2 className="w-3.5 h-3.5 text-amber-600" />
          <span>식단 공유</span>
        </button>
      </div>

      {/* Meal Reaction / Rating */}
      <div className="px-4 py-2.5 bg-slate-100/60 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-500">오늘 급식 반응:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onReact(mealKey, 'thumbsUp')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
              myReaction === 'thumbsUp'
                ? 'bg-amber-500 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
            title="최고예요"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="text-[11px]">{counts.thumbsUp}</span>
          </button>

          <button
            type="button"
            onClick={() => onReact(mealKey, 'delicious')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
              myReaction === 'delicious'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
            title="맛있어요"
          >
            <Smile className="w-3.5 h-3.5" />
            <span className="text-[11px]">{counts.delicious}</span>
          </button>

          <button
            type="button"
            onClick={() => onReact(mealKey, 'soso')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
              myReaction === 'soso'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
            title="무난해요"
          >
            <Meh className="w-3.5 h-3.5" />
            <span className="text-[11px]">{counts.soso}</span>
          </button>

          <button
            type="button"
            onClick={() => onReact(mealKey, 'bad')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
              myReaction === 'bad'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
            title="아쉬워요"
          >
            <Frown className="w-3.5 h-3.5" />
            <span className="text-[11px]">{counts.bad}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
