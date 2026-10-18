import { AllergenMeta } from '../types';

export const ALLERGEN_LIST: AllergenMeta[] = [
  { code: 1, name: '난류(계란)', category: '가금류', icon: '🥚', description: '달걀, 메추리알 등 가금류의 알' },
  { code: 2, name: '우유', category: '유제품', icon: '🥛', description: '우유, 분유, 치즈, 버터 등 유가공품' },
  { code: 3, name: '메밀', category: '곡류', icon: '🌾', description: '메밀면, 메밀전병, 메밀차 등' },
  { code: 4, name: '땅콩', category: '견과류', icon: '🥜', description: '땅콩, 피넛버터 등' },
  { code: 5, name: '대두(콩)', category: '두류', icon: '🫘', description: '된장, 간장, 두부, 콩나물 등' },
  { code: 6, name: '밀', category: '곡류', icon: '🍞', description: '밀가루, 빵, 면류, 튀김옷 등' },
  { code: 7, name: '고등어', category: '어류', icon: '🐟', description: '고등어 및 등푸른생선 가공품' },
  { code: 8, name: '게', category: '갑각류', icon: '🦀', description: '꽃게, 대게, 게살 가공품 등' },
  { code: 9, name: '새우', category: '갑각류', icon: '🦐', description: '새우, 건새우, 새우젓 등' },
  { code: 10, name: '돼지고기', category: '육류', icon: '🥩', description: '삼겹살, 제육, 햄, 소시지 등' },
  { code: 11, name: '복숭아', category: '과일류', icon: '🍑', description: '복숭아 및 복숭아 과즙 음료' },
  { code: 12, name: '토마토', category: '채소류', icon: '🍅', description: '토마토, 케첩, 토마토소스 등' },
  { code: 13, name: '아황산류', category: '식품첨가물', icon: '🧪', description: '건조과일, 와인, 식초 등 산화방지제' },
  { code: 14, name: '호두', category: '견과류', icon: '🌰', description: '호두 및 호두 함유 제과류' },
  { code: 15, name: '닭고기', category: '가금류', icon: '🍗', description: '치킨, 닭볶음탕, 닭가슴살 등' },
  { code: 16, name: '쇠고기', category: '육류', icon: '🥩', description: '불고기, 갈비, 사골, 쇠고기다시다 등' },
  { code: 17, name: '오징어', category: '연체류', icon: '🦑', description: '오징어, 오징어채, 문어 등' },
  { code: 18, name: '조개류', category: '패류', icon: '🦪', description: '굴, 전복, 홍합, 바지락 등' },
  { code: 19, name: '잣', category: '견과류', icon: '🌲', description: '잣 및 잣 함유 전통음식' },
];

export const ALLERGEN_MAP = new Map<number, AllergenMeta>(
  ALLERGEN_LIST.map((item) => [item.code, item])
);
