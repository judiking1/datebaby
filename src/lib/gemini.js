// gemini.js - Google Gemini AI 육아 코치 연동 헬퍼

const GEMINI_SYSTEM_PROMPT = `당신은 대한민국 최고의 소아청소년과 전문의이자 20년 경력의 따뜻하고 신뢰받는 베테랑 육아 코치 '닥터 베베(Dr. Bebe)'입니다.
사용자는 초보 엄마/아빠이며, 아기의 작은 변화나 돌발 행동에도 마음을 졸이고 있습니다.

당신의 답변 구성 원칙:
1. [공감과 안심]: 먼저 부모의 놀란 마음을 따뜻하게 다독이고 안심시켜주세요.
2. [원인 분석]: 아기의 현재 월령/일수(예: 생후 90일, 4개월, 임신 주차 등)의 표준 발달 단계와 원더윅스 관점에서 왜 이런 행동을 하는지 알기 쉽게 설명하세요.
3. [단계별 실천 가이드 (Action Plan)]: 부모가 당장 오늘 실천할 수 있는 행동을 '1단계, 2단계, 3단계' 번호를 매겨 구체적으로 제시하세요.
4. [주의사항 & 응급 신호]: 이것만은 피해야 할 점(Don't)과 즉시 병원에 가야 하는 위험 징후(Red Flags)를 명확히 짚어주세요.
5. [포맷팅]: 모바일에서 가독성이 극대화되도록 마크다운 문법(### 소제목, **볼드 강조**, • 글머리 기호)을 적극 활용하여 완성도 높은 완전한 문장으로 답변을 마무리하세요.`;

/**
 * Google Gemini API 호출
 */
export async function askGeminiBabyCoach({
  message,
  babyContext,
  history = [],
  apiKey
}) {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!finalApiKey) {
    throw new Error(
      "Gemini API Key가 설정되지 않았습니다. Google AI Studio(aistudio.google.com)에서 무료 API 키를 발급받아 등록해주세요."
    );
  }

  // 월령 컨텍스트 주입
  const contextHeader = babyContext
    ? `[현재 아기 정보]\n- 이름/태명: ${babyContext.name || "우리 아기"}\n- 상태: ${babyContext.ageText || "생후 정보 없음"}\n- 체중: ${babyContext.weight ? babyContext.weight + "kg" : "미입력"}\n\n`
    : "";

  const systemInstruction = `${GEMINI_SYSTEM_PROMPT}\n\n${contextHeader}`;

  const contents = [];

  // 이전 대화 기록 포맷 변환
  if (Array.isArray(history)) {
    history.forEach((h) => {
      contents.push({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }]
      });
    });
  }

  // 현재 사용자 메시지 추가
  contents.push({
    role: "user",
    parts: [{ text: message }]
  });

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    }
  };

  // 지원 모델 우선순위 체인 (20RPD 소진 시 500RPD 모델로 자동 연속 전환)
  const CANDIDATE_MODELS = [
    "gemini-3.6-flash",       // 1순위: 최신 플래그십 (20 RPD)
    "gemini-3.5-flash-lite",  // 2순위: 초고속 500 RPD (하루 500개 요청 무료!)
    "gemini-3.1-flash-lite",  // 3순위: 안정적인 500 RPD (하루 500개 요청 무료!)
    "gemini-3.5-flash",       // 4순위: 3.5 Flash (20 RPD)
    "gemini-2.5-flash"        // 5순위: 2.5 Flash 백업
  ];

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${finalApiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } else {
        const errBody = await response.text();
        console.warn(`[Gemini Fallback] ${modelName} 호출 실패 (${response.status}): ${errBody}. 다음 모델로 전환합니다.`);
        lastError = new Error(`Model ${modelName} failed (${response.status}): ${errBody}`);
      }
    } catch (fetchErr) {
      console.warn(`[Gemini Fallback] ${modelName} 네트워크 오류:`, fetchErr);
      lastError = fetchErr;
    }
  }

  throw new Error(`모든 AI 모델의 일일 사용량이 소진되었거나 오류가 발생했습니다. (${lastError?.message})`);
}
