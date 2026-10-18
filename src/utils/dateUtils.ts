export function formatDateToYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function parseYMDToDate(ymd: string): Date {
  const y = parseInt(ymd.substring(0, 4), 10);
  const m = parseInt(ymd.substring(4, 6), 10) - 1;
  const d = parseInt(ymd.substring(6, 8), 10);
  return new Date(y, m, d);
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const FULL_DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export function formatDateDisplay(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayName = FULL_DAY_NAMES[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${dayName}`;
}

export function formatDateShort(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];
  return `${m}.${d} (${dayName})`;
}

export function formatDayOnly(date: Date): string {
  return `${date.getDate()}일`;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function addDays(date: Date, days: number): Date {
  const res = new Date(date);
  res.setDate(res.getDate() + days);
  return res;
}

/**
 * Returns Monday to Friday for the week of the given date
 */
export function getSchoolWeekDays(date: Date): Date[] {
  const current = new Date(date);
  const day = current.getDay(); // 0 is Sun, 1 is Mon... 6 is Sat
  // Calculate difference to Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = addDays(current, diffToMonday);

  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    days.push(addDays(monday, i));
  }
  return days;
}

/**
 * Returns full 7 days (Mon-Sun)
 */
export function getFullWeekDays(date: Date): Date[] {
  const current = new Date(date);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = addDays(current, diffToMonday);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(monday, i));
  }
  return days;
}
