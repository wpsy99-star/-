import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Smart fallback snack suggestions if model experiences temporary high demand (503/429)
function generateFallbackSnack(
  message: string,
  mealContext?: string,
  avoidedAllergens?: string
): string {
  const lower = message.toLowerCase();

  const allergyWarning = avoidedAllergens
    ? `\n⚠️ *설정하신 알레르기(${avoidedAllergens})를 제외하고 안전하게 추천해 드려요!*`
    : '';

  if (lower.includes('매운') || lower.includes('매워') || (mealContext && mealContext.includes('제육') || mealContext?.includes('찌개') || mealContext?.includes('김치'))) {
    return `🔥 **매콤한 급식 뒤 얼얼한 혀를 달래주는 꿀조합 간식!** 🍦${allergyWarning}

1. **바닐라 아이스크림 / 소프트콘**
   • 매운 캡사이신 성분은 유지방과 차가운 온도가 싹 씻어내 줘요!
2. **달콤 상큼한 샤인머스캣 or 청포도 주스**
   • 입안이 깔끔해지고 즉각적인 비타민 충전 완료!
3. **꿀호떡 토스트 or 연유 붕어빵**
   • 매운맛 뒤에 먹는 달달 쫀득함은 학창시절 국룰 디저트예요!`;
  }

  if (lower.includes('편의점') || lower.includes('cu') || lower.includes('gs') || lower.includes('세븐')) {
    return `🏪 **하교길 편의점 털이 인기 간식 베스트 3!** 🧃${allergyWarning}

1. **매콤달콤 핫바 & 복숭아 아이스티**
   • 간단하고 든든하게 단짠 조합 완성!
2. **삼각김밥 & 모짜렐라 치즈 스트링**
   • 전자레인지 20초 돌려서 치즈 쭉 늘려 먹으면 최고예요.
3. **초코 크림롤 or 뚱카롱**
   • 지친 오후 4시, 급식 후 2차 당충전에 이만한 게 없죠!`;
  }

  if (lower.includes('다이어트') || lower.includes('건강') || lower.includes('칼로리') || lower.includes('살')) {
    return `🥗 **부담 없이 가볍고 든든한 저칼로리 헬시 간식!** 🌱${allergyWarning}

1. **구운 계란 & 바나나**
   • 포만감은 오래 가고 칼로리는 약 150kcal로 착한 든든 간식!
2. **곤약 젤리 (복숭아/청포도맛)**
   • 한 봉지에 5~10kcal! 시원하고 쫀득한 씹는 맛까지 챙겨요.
3. **그릭 요거트 & 한 줌 견과류**
   • 당류는 적고 단백질과 유익균 가득해서 장 건강에도 굿!`;
  }

  if (lower.includes('시험') || lower.includes('공부') || lower.includes('집중') || lower.includes('졸려') || lower.includes('잠')) {
    return `⚡ **뇌를 깨우는 시험기간 집중력 부스터 간식!** 🧠${allergyWarning}

1. **다크 초콜릿 (카카오 72% 이상)**
   • 플라보노이드와 테오브로민이 두뇌 회전과 집중력을 끌어올려 줘요!
2. **시원한 민트 캔디 or 톡 쏘는 탄산수**
   • 식곤증으로 쏟아지는 잠을 확 깨워주는 리프레시 콤보!
3. **볶은 아몬드 & 호두 한 줌**
   • 오메가3와 비타민E가 풍부해 공부할 때 최고의 브레인 푸드!`;
  }

  // Default friendly snack recommendation
  return `😋 **오늘 급식 후 출출할 때 딱 좋은 센스 만점 간식 추천!** 🍪${allergyWarning}

${mealContext ? `📋 *오늘 식단(${mealContext})과 밸런스를 맞췄어요!*` : ''}

1. **따끈한 찹쌀 꽈배기 or 붕어빵**
   • 겉바속촉 달콤한 설탕 코팅으로 방과 후 든든한 에너지 보충!
2. **생과일 그릭요거트 볼 or 컵과일**
   • 급식에 부족하기 쉬운 상큼한 비타민과 유산균을 보충해 줘요.
3. **달콤 고소한 미숫가루 라떼**
   • 든든하면서도 속이 편안해 학원 가기 전 최고의 선택!

궁금한 간식 종류(예: '편의점 간식', '단백질 간식', '500원~1000원대 간식')를 말씀해주시면 더 꼭 맞게 찾아드릴게요!`;
}

// Snack Chatbot API Route
app.post('/api/snack-chat', async (req, res) => {
  try {
    const { message, history = [], mealContext = '', avoidedAllergens = '' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    // Try Gemini model first if client is configured
    if (ai) {
      try {
        const systemPrompt = `당신은 센스 있고 친절한 한국 학교 급식 & 매점/편의점 맞춤 간식 추천 AI 챗봇 '냠냠이'입니다.
학생과 학부모의 눈높이에서 오늘 급식 메뉴와 칼로리, 알레르기 주의사항을 바탕으로 어울리는 디저트와 간식을 재미있고 다정하게 추천해줍니다.
- 현재 사용자가 제공한 급식 정보: ${mealContext || '급식 정보 미선택'}
- 사용자가 기피해야 하는 알레르기 식재료: ${avoidedAllergens || '없음'}

지침:
1. 사용자가 피해야 하는 알레르기 식품이 있다면 해당 재료가 들어간 간식은 반드시 제외하세요.
2. 학생들이 편의점(CU, GS25, 세븐일레븐), 학교 앞 분식점, 베이커리, 마트에서 쉽게 구할 수 있는 가성비 간식이나 홈메이드 조합을 추천하세요.
3. 추천 이유(영양 밸런스, 매운맛 중화, 당 충전 등)를 친절하게 곁들여주세요.
4. 예쁜 이모지와 읽기 좋은 글머리 기호(•)를 적절히 사용하세요.`;

        // Build conversation contents
        const contents: any[] = [];
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.8,
          },
        });

        if (response.text) {
          return res.json({ text: response.text });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call returned error, falling back to smart recommender:', geminiError?.message || geminiError);
        // Fall through to smart fallback
      }
    }

    // If Gemini is busy (503/429) or no key, return smart fallback
    const fallbackText = generateFallbackSnack(message, mealContext, avoidedAllergens);
    return res.json({ text: fallbackText });
  } catch (err: any) {
    console.error('Error in /api/snack-chat:', err);
    return res.status(500).json({
      text: '간식 추천 중 일시적인 오류가 발생했습니다. 잠시 후 다시 질문해주세요!',
    });
  }
});

// Vite middleware or static serving
async function setupServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupServer();
