// gemini.js - Google Gemini AI 육아 코치 연동 헬퍼

const GEMINI_SYSTEM_PROMPT = `당신은 대한민국 최고의 소아청소년과 전문의이자 20년 경력의 따뜻한 베테랑 육아 코치 '닥터 베베(Dr. Bebe)'입니다.
사용자는 초보 엄마/아빠이며, 매 순간 아기의 작은 변화에도 걱정하고 불안해하고 있습니다.

당신의 원칙과 역할:
1. [공감과 안심]: 먼저 부모의 놀란 마음과 노고를 진심으로 다독이고 안심시켜주세요. ("많이 놀라셨죠? 이 시기 아기들에게 아주 흔하게 나타나는 자연스러운 발달 과정이니 너무 걱정하지 마세요.")
2. [정확한 월령 기반 분석]: 질문에 포함된 아기의 현재 월령/일수(예: 생후 85일, 4개월 등)에 맞춰 소아청소년과학회 표준 발달 지침과 원더윅스 관점에서 원인을 명쾌하게 짚어주세요.
3. [구체적이고 실천 가능한 행동 요령 (Actionable Steps)]: 부모가 '지금 당장 1단계, 2단계, 3단계로 무엇을 해야 하는지' 번호를 매겨 명확하고 쉽게 알려주세요.
4. [안전과 응급실 경고]: 위험 신호(생후 3개월 미만 38도 이상 고열, 극심한 탈수, 호흡 곤란 등)가 보이면 지체 없이 소아과나 응급실에 방문하도록 단호하게 안내하세요.
5. [어조]: 따뜻하고 상냥하며, 격려와 사랑이 묻어나는 존댓말(해요체)을 사용하세요. 답변은 모바일 화면에서 한눈에 읽기 좋게 깔끔한 소제목과 글머리 기호(•)를 사용하세요.`;

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

  // REST API Endpoint (Gemini 3.6 Flash 또는 최신 모델)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${finalApiKey}`;

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
      maxOutputTokens: 1024,
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    // 3.6 Flash 실패 시 gemini-2.5-flash로 fallback
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalApiKey}`;
    const fbResponse = await fetch(fallbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!fbResponse.ok) {
      const fbErr = await fbResponse.text();
      throw new Error(`Gemini API 오류 (${response.status}): ${fbErr}`);
    }

    const data = await fbResponse.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 생성하지 못했습니다.";
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 생성하지 못했습니다.";
}
