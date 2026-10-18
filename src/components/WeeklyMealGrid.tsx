import React from 'react';
import { MealItem, SchoolInfo } from '../types';
import {
  formatDateShort,
  formatDateToYMD,
  isSameDay,
} from '../utils/dateUtils';
import { ALLERGEN_MAP } from '../data/allergens';
import { Flame, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

interface WeeklyMealGridProps {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  mealsByDate: Record<string, MealItem[]>;
  selectedAllergens: number[];
  onOpenDetailedDay: (d: Date) => void;
}

export const WeeklyMealGrid: React.FC<WeeklyMealGridProps> = ({
  weekDays,
  selectedDate,
  onSelectDate,
  mealsByDate,
  selectedAllergens,
  onOpenDetailedDay,
}) => {
  const today = new Date();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>월요일부터 금요일까지 한 주의 식단표를 확인하세요.</span>
        <span>날짜 카드를 누르면 상세 일간 보기로 전환됩니다.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {weekDays.map((day) => {
          const ymd = formatDateToYMD(day);
          const dayMeals = mealsByDate[ymd] || [];
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);

          // Get primary lunch or first meal
          const lunch = dayMeals.find((m) => m.mealCode === '2') || dayMeals[0];

          // Check allergens
          const hasAvoidedAllergen = lunch?.dishes.some((d) =>
            d.allergenCodes.some((code) => selectedAllergens.includes(code))
          );

          return (
            <div
              key={ymd}
              onClick={() => {
                onSelectDate(day);
              }}
              className={`bg-white rounded-2xl border transition flex flex-col overflow-hidden cursor-pointer ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-300 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Day Card Header */}
              <div
                className={`p-3 border-b text-center ${
                  isToday
                    ? 'bg-amber-500 text-white border-amber-600'
                    : isSelected
                    ? 'bg-amber-50 text-slate-900 border-amber-200'
                    : 'bg-slate-50 text-slate-800 border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {formatDateShort(day)}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-white text-amber-600">
                      오늘
                    </span>
                  )}
                </div>
              </div>

              {/* Day Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                {!lunch || lunch.dishes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    급식 없음 (휴일/주말)
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      {lunch.dishes.map((dish) => {
                        const isAvoided = dish.allergenCodes.some((c) =>
                          selectedAllergens.includes(c)
                        );

                        return (
                          <div
                            key={dish.id}
                            className={`text-xs p-1.5 rounded-lg flex items-center justify-between gap-1 ${
                              isAvoided
                                ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200'
                                : 'text-slate-700 bg-slate-50/60'
                            }`}
                          >
                            <span className="truncate">{dish.name}</span>
                            {dish.isPopular && (
                              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                            )}
                            {isAvoided && (
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-orange-600">
                        <Flame className="w-3 h-3" />
                        {lunch.calories ? lunch.calories.split(' ')[0] : '-'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetailedDay(day);
                        }}
                        className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-0.5"
                      >
                        상세 <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
