import React, { useRef } from 'react';
import { ViewMode } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Columns,
  List,
} from 'lucide-react';
import {
  addDays,
  formatDateDisplay,
  formatDateToYMD,
  isSameDay,
  isWeekend,
} from '../utils/dateUtils';

interface DatePickerBarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export const DatePickerBar: React.FC<DatePickerBarProps> = ({
  selectedDate,
  onSelectDate,
  viewMode,
  onChangeViewMode,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const isSelectedToday = isSameDay(selectedDate, today);
  const isSelectedWeekend = isWeekend(selectedDate);

  const handlePrevDay = () => {
    onSelectDate(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    onSelectDate(addDays(selectedDate, 1));
  };

  const handlePrevWeek = () => {
    onSelectDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    onSelectDate(addDays(selectedDate, 7));
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      onSelectDate(newDate);
    }
  };

  const formattedNativeDate = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3">
      {/* Upper row: Navigation + ViewMode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Date Stepper */}
        <div className="flex items-center gap-1.5 justify-between sm:justify-start">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={viewMode === 'week' ? handlePrevWeek : handlePrevDay}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              title={viewMode === 'week' ? '이전 주' : '이전 날'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Custom styled date button that triggers native date picker */}
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm sm:text-base transition group"
            >
              <CalendarIcon className="w-4 h-4 text-amber-500" />
              <span>{formatDateDisplay(selectedDate)}</span>
              {isSelectedToday && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  오늘
                </span>
              )}
              {isSelectedWeekend && !isSelectedToday && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                  주말
                </span>
              )}

              {/* Hidden native input */}
              <input
                ref={dateInputRef}
                type="date"
                value={formattedNativeDate}
                onChange={handleNativeDateChange}
                className="sr-only"
                aria-label="날짜 선택"
              />
            </button>

            <button
              type="button"
              onClick={viewMode === 'week' ? handleNextWeek : handleNextDay}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              title={viewMode === 'week' ? '다음 주' : '다음 날'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher (일간 / 주간) */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Quick jumps */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectDate(addDays(today, -1))}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              어제
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(today)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isSelectedToday
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              오늘
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(addDays(today, 1))}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              내일
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Toggle pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onChangeViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'day'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>일간 상세</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>주간 식단표</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
