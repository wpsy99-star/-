import { DishItem, MealItem, NutritionItem, SchoolInfo } from '../types';

const POPULAR_KEYWORDS = [
  '치킨', '돈까스', '스파게티', '파스타', '피자', '떡볶이', '불고기', '갈비',
  '탕수육', '햄버거', '카레', '짜장', '비빔밥', '닭강정', '꿔바로우', '핫도그',
  '와플', '케이크', '아이스크림', '타코야끼', '오므라이스', '마라탕', '마카롱'
];

/**
 * Parses raw DDISH_NM string into structured DishItem list
 * e.g. "혼합잡곡밥 (5)<br/>된장찌개 (5.6)<br/>제육볶음 (5.6.10.13)<br/>배추김치 (9)"
 */
export function parseDishes(rawDishString: string): DishItem[] {
  if (!rawDishString) return [];

  // Replace <br/>, <br>, \n with a delimiter
  const lines = rawDishString
    .replace(/<br\s*[\/]?>/gi, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return lines.map((line, idx) => {
    // Check for allergen codes in parentheses like (1.2.5.6.10)
    const match = line.match(/\(([0-9.]+)\)\s*$/);
    let allergenCodes: number[] = [];
    let cleanName = line;

    if (match) {
      allergenCodes = match[1]
        .split('.')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n));
      cleanName = line.replace(/\s*\(([0-9.]+)\)\s*$/, '').trim();
    }

    const isPopular = POPULAR_KEYWORDS.some((kw) => cleanName.includes(kw));

    return {
      id: `dish-${idx}-${cleanName}`,
      name: cleanName,
      rawString: line,
      allergenCodes,
      isPopular,
    };
  });
}

/**
 * Parses NTR_INFO string into structured NutritionItem list
 * e.g. "탄수화물(g) : 243.0<br/>단백질(g) : 52.6<br/>지방(g) : 15.9..."
 */
export function parseNutrition(rawNutrition: string): NutritionItem[] {
  if (!rawNutrition) return [];

  const lines = rawNutrition
    .replace(/<br\s*[\/]?>/gi, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const results: NutritionItem[] = [];

  for (const line of lines) {
    // Format: Name(unit) : value
    const match = line.match(/^([^:(]+)(?:\(([^)]+)\))?\s*:\s*([0-9.]+)/);
    if (match) {
      const name = match[1].trim();
      const unit = match[2]?.trim() || 'g';
      const value = parseFloat(match[3]);
      if (!isNaN(value)) {
        results.push({ name, unit, value });
      }
    }
  }

  return results;
}

/**
 * Parses ORPLC_INFO string into clean array
 */
export function parseOrigin(rawOrigin: string): string[] {
  if (!rawOrigin) return [];
  return rawOrigin
    .replace(/<br\s*[\/]?>/gi, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('비고 :'));
}

/**
 * Search schools using NEIS Open API
 */
export async function searchSchools(
  keyword: string,
  ofcdcCode?: string,
  schoolType?: string
): Promise<SchoolInfo[]> {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  try {
    let url = `https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=50&SCHUL_NM=${encodeURIComponent(trimmed)}`;
    if (ofcdcCode) {
      url += `&ATPT_OFCDC_SC_CODE=${encodeURIComponent(ofcdcCode)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`학교 정보 조회 실패 (HTTP ${res.status})`);
    }

    const data = await res.json();

    if (!data.schoolInfo || !data.schoolInfo[1]?.row) {
      return [];
    }

    let schools: SchoolInfo[] = data.schoolInfo[1].row;

    // Filter by school type if requested (초등학교, 중학교, 고등학교, 특수학교)
    if (schoolType) {
      schools = schools.filter((s) => s.SCHUL_KND_SC_NM === schoolType);
    }

    return schools;
  } catch (err) {
    console.error('Error searching schools:', err);
    throw err;
  }
}

/**
 * Fetch school meals for a date range
 */
export async function fetchMealsByRange(
  ofcdcCode: string,
  schoolCode: string,
  fromDate: string, // YYYYMMDD
  toDate: string    // YYYYMMDD
): Promise<MealItem[]> {
  try {
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${encodeURIComponent(
      ofcdcCode
    )}&SD_SCHUL_CODE=${encodeURIComponent(schoolCode)}&MLSV_FROM_YMD=${encodeURIComponent(
      fromDate
    )}&MLSV_TO_YMD=${encodeURIComponent(toDate)}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`급식 정보 조회 실패 (HTTP ${res.status})`);
    }

    const data = await res.json();

    if (!data.mealServiceDietInfo || !data.mealServiceDietInfo[1]?.row) {
      return [];
    }

    const rows = data.mealServiceDietInfo[1].row;

    return rows.map((row: any) => {
      const calMatch = (row.CAL_INFO || '').match(/([0-9.]+)/);
      const calorieNumber = calMatch ? parseFloat(calMatch[1]) : undefined;

      return {
        mealCode: (row.MMEAL_SC_CODE || '2') as '1' | '2' | '3',
        mealName: row.MMEAL_SC_NM || '중식',
        date: row.MLSV_YMD,
        calories: row.CAL_INFO || '',
        calorieNumber,
        dishes: parseDishes(row.DDISH_NM || ''),
        originInfo: parseOrigin(row.ORPLC_INFO || ''),
        nutritionInfo: parseNutrition(row.NTR_INFO || ''),
        servingCount: row.MLSV_FGR ? Number(row.MLSV_FGR) : undefined,
      };
    });
  } catch (err) {
    console.error('Error fetching meals:', err);
    throw err;
  }
}
