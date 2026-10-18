export interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  ENG_SCHUL_NM?: string;
  SCHUL_KND_SC_NM: string; // 초등학교, 중학교, 고등학교, 특수학교 등
  LCTN_SC_NM: string;
  ORG_RDNMA: string;
  ORG_TELNO?: string;
  HMPG_ADRES?: string;
  COEDU_SC_NM?: string;
  FOND_SC_NM?: string;
}

export interface DishItem {
  id: string;
  name: string;
  rawString: string;
  allergenCodes: number[];
  isPopular?: boolean;
}

export interface NutritionItem {
  name: string;
  unit: string;
  value: number;
}

export interface MealItem {
  mealCode: '1' | '2' | '3'; // 1: 조식, 2: 중식, 3: 석식
  mealName: string;          // "조식", "중식", "석식"
  date: string;              // "YYYYMMDD"
  calories: string;          // "1213.2 Kcal"
  calorieNumber?: number;
  dishes: DishItem[];
  originInfo: string[];
  nutritionInfo: NutritionItem[];
  servingCount?: number;
}

export type ViewMode = 'day' | 'week';

export interface AllergenMeta {
  code: number;
  name: string;
  category: string;
  icon: string;
  description: string;
}

export interface MealReaction {
  thumbsUp: number;
  delicious: number;
  soso: number;
  bad: number;
  userSelection?: 'thumbsUp' | 'delicious' | 'soso' | 'bad';
}
