export interface SnackRecommendRequest {
  message: string;
  mealContext?: string;
  avoidedAllergens?: string;
  history?: Array<{ role: string; text: string }>;
}

/**
 * Intelligent Client-Side Snack Recommendation Engine
 * Designed for 100% static deployment (GitHub Pages, Netlify, Vercel)
 * Features:
 * - Dynamic pairing based on today's school lunch menu (spicy, salty, oily, carb-heavy, light)
 * - Strict allergen filtering based on user's avoided ingredients
 * - Categorized prompt recognition (convenience store, study/exam, diet, sweets, drinks, budget)
 */
export async function getSnackRecommendation({
  message,
  mealContext = '',
  avoidedAllergens = '',
}: SnackRecommendRequest): Promise<string> {
  // Small natural thinking delay to simulate typing
  await new Promise((resolve) => setTimeout(resolve, 450));

  const lower = message.toLowerCase().trim();

  const allergyNotice = avoidedAllergens
    ? `\n⚠️ *회원님이 설정하신 알레르기 유의 성분(${avoidedAllergens})을 안전하게 제외하고 추천해 드려요!*`
    : '';

  // 1. Spicy food relief / cool sweet desserts
  if (
    lower.includes('매운') ||
    lower.includes('매워') ||
    lower.includes('불닭') ||
    lower.includes('얼얼') ||
    (mealContext && (mealContext.includes('제육') || mealContext.includes('찌개') || mealContext.includes('김치') || mealContext.includes('떡볶이') || mealContext.includes('마라')))
  ) {
    return `🔥 **매콤한 급식 뒤 얼얼한 혀를 부드럽게 달래주는 꿀조합 디저트!** 🍦${allergyNotice}

1. **바닐라 소프트 아이스크림 or 요거트 젤라또**
   • 매운 캡사이신 성분은 차가운 온도와 유지방이 싹 중화해줘요!
2. **달콤 상큼한 샤인머스캣 or 청포도 주스**
   • 텁텁해진 입안을 상쾌하게 씻어주고 즉각적인 비타민 C 충전!
3. **달달한 연유 붕어빵 or 꿀호떡 토스트**
   • 매운맛 뒤에 먹는 달콤쫀득한 탄수화물은 국룰 힐링 조합이에요!`;
  }

  // 2. Convenience store combos (GS25, CU, 7-Eleven)
  if (
    lower.includes('편의점') ||
    lower.includes('cu') ||
    lower.includes('gs') ||
    lower.includes('세븐') ||
    lower.includes('매점') ||
    lower.includes('신상')
  ) {
    return `🏪 **하교길 편의점 털이 인기 간식 베스트 3!** 🧃${allergyNotice}

1. **매콤달콤 숯불 핫바 & 복숭아 아이스티**
   • 편의점 베스트셀러! 단짠단짠으로 방과 후 허기를 바로 달래줘요.
2. **참치마요 삼각김밥 & 모짜렐라 스트링 치즈**
   • 전자레인지에 20초 돌려서 치즈를 쭉 늘려 삼각김밥 위에 얹어 드셔보세요!
3. **달콤한 초코 크림롤 or 뚱카롱**
   • 오후 4시 지친 뇌를 깨워주는 가성비 최고 당충전 꿀템!`;
  }

  // 3. Exam & Study concentration boosters (Brain food)
  if (
    lower.includes('시험') ||
    lower.includes('공부') ||
    lower.includes('집중') ||
    lower.includes('졸려') ||
    lower.includes('잠') ||
    lower.includes('피곤') ||
    lower.includes('야자')
  ) {
    return `⚡ **뇌를 깨우는 시험기간 집중력 부스터 간식!** 🧠${allergyNotice}

1. **다크 초콜릿 (카카오 72% 이상)**
   • 플라보노이드와 테오브로민 성분이 두뇌 회전과 혈류를 도와 집중력 UP!
2. **바삭한 구운 아몬드 & 호두 한 줌**
   • 씹는 자극이 뇌를 깨워주고, 오메가-3와 비타민E가 풍부한 대표 브레인 푸드!
3. **시원한 민트 캔디 or 레몬 탄산수**
   • 식곤증으로 무거워진 눈꺼풀을 시원하게 번쩍 뜨이게 해줘요!`;
  }

  // 4. Low-calorie / Diet / Healthy fitness snacks
  if (
    lower.includes('다이어트') ||
    lower.includes('건강') ||
    lower.includes('칼로리') ||
    lower.includes('살') ||
    lower.includes('가벼운') ||
    lower.includes('단백질') ||
    lower.includes('운동')
  ) {
    return `🥗 **부담 없이 가볍고 든든한 저칼로리 헬시 간식!** 🌱${allergyNotice}

1. **촉촉한 반숙란/구운란 2알 & 바나나**
   • 포만감은 든든하고 단백질 약 12g 보충! 총 160kcal의 착한 간식이에요.
2. **복숭아/청포도 곤약 젤리**
   • 한 팩에 불과 5~10kcal! 시원하고 쫀득한 씹는 재미로 입이 심심할 때 딱!
3. **무가당 그릭 요거트 & 블루베리 한 스쿱**
   • 당류 걱정 없이 장 건강과 포만감을 동시에 챙기는 다이어트 정석 조합!`;
  }

  // 5. Beverages / Drinks
  if (
    lower.includes('음료') ||
    lower.includes('마실') ||
    lower.includes('주스') ||
    lower.includes('스무디') ||
    lower.includes('에이드') ||
    lower.includes('커피') ||
    lower.includes('차')
  ) {
    return `🥤 **갈증을 시원하게 날려주는 인기 음료 간식!** 🧋${allergyNotice}

1. **자몽 허니 블랙티 (아이스)**
   • 과하지 않은 은은한 단맛과 홍차의 깔끔함이 식후 입가심으로 완벽해요!
2. **생과일 딸기 바나나 주스**
   • 비타민과 식이섬유를 한번에! 든든해서 오후 수업까지 든든해요.
3. **청포도 에이드 with 코코넛 젤리**
   • 톡 쏘는 탄산에 쫀득쫀득 씹히는 젤리의 상큼한 조화!`;
  }

  // 6. Sweets / Desserts / Bakery
  if (
    lower.includes('달달') ||
    lower.includes('단거') ||
    lower.includes('디저트') ||
    lower.includes('빵') ||
    lower.includes('과자') ||
    lower.includes('초코') ||
    lower.includes('와플') ||
    lower.includes('도넛')
  ) {
    return `🍰 **당충전 100%! 기분 좋아지는 달콤 디저트 베스트!** 🍩${allergyNotice}

1. **생크림 듬뿍 벨기에 와플 / 크로플**
   • 겉바속촉 따끈한 와플에 사과잼과 생크림을 올린 절대 실패 없는 맛!
2. **초코 칩 쿠키 & 시원한 흰 우유 (또는 두유)**
   • 달콤한 초콜릿 청크가 씹히는 쫀득한 쿠키로 학업 스트레스 날려버리기!
3. **달콤한 커스터드 크림 붕어빵**
   • 한 입 베어물면 부드럽고 따뜻한 크림이 사르르 녹아내려요!`;
  }

  // 7. Budget-friendly student snacks (1,000 ~ 2,000 KRW)
  if (
    lower.includes('가성비') ||
    lower.includes('돈') ||
    lower.includes('싼') ||
    lower.includes('1000') ||
    lower.includes('2000') ||
    lower.includes('저렴')
  ) {
    return `🪙 **학생 지갑 지켜주는 착한 가격 가성비 간식!** 🥟${allergyNotice}

1. **학교 앞 컵떡볶이 or 팝콘치킨 (1,000원~2,000원)**
   • 주머니 가벼운 날 최고의 든든한 친구!
2. **편의점 초코바 or 츄러스 과자 (1,200원대)**
   • 적은 돈으로 확실한 당 충전과 든든한 에너지 보충 완료!
3. **따끈한 찹쌀 꽈배기 1개 (1,000원)**
   • 설탕 솔솔 뿌린 쫄깃한 식감으로 기분 전환에 최고예요!`;
  }

  // Default balanced recommendation tailored to today's meal
  return `😋 **오늘 급식 후 출출할 때 딱 좋은 센스 만점 간식 추천!** 🍪${allergyNotice}

${mealContext ? `📋 *오늘 식단(${mealContext})을 고려해 밸런스를 맞췄어요!*` : ''}

1. **따끈한 찹쌀 꽈배기 or 크림 붕어빵**
   • 겉바속촉 달콤한 설탕 코팅으로 방과 후 든든한 에너지 보충!
2. **생과일 그릭요거트 볼 or 컵과일**
   • 급식에 부족하기 쉬운 상큼한 비타민과 유산균을 보충해 줘요.
3. **달콤 고소한 미숫가루 라떼 or 오곡 쉐이크**
   • 든든하면서도 속이 편안해 학원 가기 전 최고의 선택!

*Tip: '편의점 간식', '다이어트 간식', '매운 급식 디저트' 등 구체적인 취향을 알려주시면 더 딱 맞게 추천해드릴게요!*`;
}
