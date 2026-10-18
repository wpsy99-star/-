import React from 'react';
import { MealItem } from '../types';
import { X, Activity, PieChart, ShieldCheck, Info } from 'lucide-react';

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: MealItem | null;
  schoolName: string;
}

export const NutritionModal: React.FC<NutritionModalProps> = ({
  isOpen,
  onClose,
  meal,
  schoolName,
}) => {
  if (!isOpen || !meal) return null;

  // Recommended daily reference values (approx standard single meal target for adolescents/students)
  // ~ 1/3 of daily standard: Carbs ~ 100-120g, Protein ~ 20-30g, Fat ~ 15-25g, Calcium ~ 250mg, Iron ~ 4-5mg
  const getReferencePercentage = (name: string, value: number): number | null => {
    if (name.includes('탄수화물')) return Math.min(Math.round((value / 110) * 100), 100);
    if (name.includes('단백질')) return Math.min(Math.round((value / 25) * 100), 100);
    if (name.includes('지방')) return Math.min(Math.round((value / 20) * 100), 100);
    if (name.includes('칼슘')) return Math.min(Math.round((value / 270) * 100), 100);
    if (name.includes('철분')) return Math.min(Math.round((value / 4.5) * 100), 100);
    if (name.includes('비타민C')) return Math.min(Math.round((value / 33) * 100), 100);
    return null;
  };

  // Extract major nutrients
  const carbs = meal.nutritionInfo.find((n) => n.name.includes('탄수화물'))?.value || 0;
  const protein = meal.nutritionInfo.find((n) => n.name.includes('단백질'))?.value || 0;
  const fat = meal.nutritionInfo.find((n) => n.name.includes('지방'))?.value || 0;

  // Calculate macro energy ratio (4 kcal/g carbs, 4 kcal/g protein, 9 kcal/g fat)
  const carbKcal = carbs * 4;
  const proteinKcal = protein * 4;
  const fatKcal = fat * 9;
  const totalMacroKcal = carbKcal + proteinKcal + fatKcal;

  const carbPercent = totalMacroKcal > 0 ? Math.round((carbKcal / totalMacroKcal) * 100) : 60;
  const proteinPercent = totalMacroKcal > 0 ? Math.round((proteinKcal / totalMacroKcal) * 100) : 20;
  const fatPercent = totalMacroKcal > 0 ? Math.max(0, 100 - carbPercent - proteinPercent) : 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                영양 성분 & 칼로리 상세 분석
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {schoolName} · {meal.mealName} ({meal.calories || '칼로리 정보 없음'})
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

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Calorie Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                총 열량
              </span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">
                {meal.calories || '정보 준비중'}
              </div>
            </div>
            {meal.servingCount && (
              <div className="text-right">
                <span className="text-xs text-slate-400">급식 인원수</span>
                <p className="text-sm font-semibold text-slate-700">
                  약 {meal.servingCount.toLocaleString()}명
                </p>
              </div>
            )}
          </div>

          {/* 3대 영양소 에너지 비율 */}
          {totalMacroKcal > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-emerald-600" /> 3대 영양소 에너지 비율
                </span>
                <span className="text-slate-400 font-normal">탄 : 단 : 지</span>
              </div>
              {/* Stacked bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${carbPercent}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`탄수화물 ${carbPercent}%`}
                />
                <div
                  style={{ width: `${proteinPercent}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`단백질 ${proteinPercent}%`}
                />
                <div
                  style={{ width: `${fatPercent}%` }}
                  className="bg-sky-500 transition-all duration-500"
                  title={`지방 ${fatPercent}%`}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-amber-800 font-bold">{carbPercent}%</div>
                  <div className="text-slate-500 text-[11px]">탄수화물 ({carbs}g)</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-emerald-800 font-bold">{proteinPercent}%</div>
                  <div className="text-slate-500 text-[11px]">단백질 ({protein}g)</div>
                </div>
                <div className="p-2 rounded-lg bg-sky-50 border border-sky-100">
                  <div className="text-sky-800 font-bold">{fatPercent}%</div>
                  <div className="text-slate-500 text-[11px]">지방 ({fat}g)</div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Nutrient List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              영양 성분 함량 및 권장량 기준
            </h3>
            {meal.nutritionInfo.length === 0 ? (
              <p className="text-sm text-slate-400 p-4 text-center bg-slate-50 rounded-xl">
                등록된 상세 영양 성분 정보가 없습니다.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                {meal.nutritionInfo.map((item, idx) => {
                  const percent = getReferencePercentage(item.name, item.value);
                  return (
                    <div key={idx} className="p-3 flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        {percent !== null && (
                          <div className="text-[11px] text-slate-400">
                            한 끼 권장 기준의 약 {percent}%
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">
                          {item.value} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Advice card */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              학교 급식은 교육부 학교급식법 기준에 따라 영양교사/영양사에 의해 성장기 학생들의 발달에 필요한 영양권장량을 충족하도록 설계됩니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
