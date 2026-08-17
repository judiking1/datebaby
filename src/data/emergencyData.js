// emergencyData.js - 소아 응급 처치, 해열제 계산 및 응급실 체크리스트

export const FEVER_LEVELS = [
  {
    range: "36.5°C ~ 37.4°C",
    status: "정상 체온 (Normal)",
    color: "emerald",
    action: "아주 건강한 상태입니다. 평소대로 편안하게 돌봐주세요."
  },
  {
    range: "37.5°C ~ 37.9°C",
    status: "미열 (Low Fever)",
    color: "amber",
    action: "옷을 얇게 입히고 방 온도를 22~24°C로 시원하게 유지해주세요. 수분을 충분히 보충하며 30분~1시간 간격으로 체온을 재측정하세요."
  },
  {
    range: "38.0°C ~ 38.9°C",
    status: "발열 (Fever)",
    color: "orange",
    action: "아기가 힘들어하거나 처지면 해열제를 복용시키세요. (생후 3개월 미만은 해열제 투약 전 즉시 소아과나 응급실 방문 필수!)"
  },
  {
    range: "39.0°C 이상",
    status: "고열 (High Fever)",
    color: "rose",
    action: "해열제를 즉시 복용시키고, 30분 후 미온수(30°C 정도) 손수건으로 목, 겨드랑이, 사타구니를 가볍게 닦아주세요. (절대 알코올이나 찬물 사용 금지)"
  }
];

export const MEDICINE_TYPES = [
  {
    id: "acetaminophen",
    name: "아세트아미노펜 (타이레놀/챔프 빨강/콜대원 보라)",
    minAgeMonths: 4, // 3개월 미만은 의사 처방
    dosagePerKgMin: 0.3,
    dosagePerKgMax: 0.4,
    intervalHours: "4 ~ 6시간",
    maxTimesPerDay: 5,
    note: "생후 4개월 이후부터 안전하게 복용 가능. 위장 장애가 적음.",
    brandExamples: "어린이 타이레놀 현탁액, 챔프 시럽(빨강), 파인큐(빨강)"
  },
  {
    id: "ibuprofen",
    name: "이부프로펜 (부루펜/챔프 파랑/콜대원 주황)",
    minAgeMonths: 6,
    dosagePerKgMin: 0.3,
    dosagePerKgMax: 0.5,
    intervalHours: "6 ~ 8시간",
    maxTimesPerDay: 4,
    note: "생후 6개월 이상 복용 가능. 소염 진통 효과가 뛰어나며 인후염/중이염 동반 시 효과적.",
    brandExamples: "어린이 부루펜 시럽, 챔프 이부펜(파랑), 대원 이부프로펜"
  },
  {
    id: "dexibuprofen",
    name: "덱시부프로펜 (맥시부펜/챔프 덱시)",
    minAgeMonths: 6,
    dosagePerKgMin: 0.4,
    dosagePerKgMax: 0.6,
    intervalHours: "4 ~ 6시간",
    maxTimesPerDay: 4,
    note: "생후 6개월 이상 복용 가능. 이부프로펜의 유효성분만 추출하여 적은 양으로 빠른 효과.",
    brandExamples: "맥시부펜 시럽, 애니펜 시럽"
  }
];

export const CROSS_DOSING_RULES = {
  rule1: "같은 계열 해열제는 최소 4~6시간 간격을 지켜야 합니다.",
  rule2: "다른 계열(아세트아미노펜 ↔ 이부프로펜/덱시부프로펜)은 2시간 뒤에도 열이 안 떨어질 때 교차복용 가능합니다.",
  rule3: "⚠️ 주의: 이부프로펜과 덱시부프로펜은 '같은 NSAIDs 계열'이므로 절대 서로 교차복용하면 안 됩니다!"
};

export const RED_FLAG_EMERGENCY_LIST = [
  {
    title: "생후 100일(3개월) 미만 아기의 38.0°C 이상 발열",
    desc: "신생아는 면역 체계가 미숙하여 패혈증 등 중증 감염 위험이 있으므로 즉시 응급실로 가야 합니다.",
    level: "CRITICAL"
  },
  {
    title: "호흡 곤란 (숨을 쌕쌕거리거나 가슴/갈비뼈가 쑥 들어감)",
    desc: "호흡수가 분당 60회 이상이거나 입술이 파래지는 청색증이 동반되면 즉시 119를 호출하세요.",
    level: "CRITICAL"
  },
  {
    title: "극심한 탈수 징후",
    desc: "8시간 이상 소변을 안 보거나, 기저귀가 마르고, 울어도 눈물이 안 나며 입술과 혀가 바짝 마를 때.",
    level: "HIGH"
  },
  {
    title: "처짐과 의식 저하",
    desc: "깨워도 눈을 잘 못 맞추고 팔다리에 힘이 없이 축 늘어지거나 자극에 반응이 미약할 때.",
    level: "HIGH"
  },
  {
    title: "열성 경련 (15분 이상 지속되거나 신체 한쪽만 떨림)",
    desc: "경련 시 입안에 손이나 물건을 넣지 말고 옆으로 눕혀 기도를 확보한 뒤 119에 연락하세요.",
    level: "CRITICAL"
  },
  {
    title: "반복적인 분수토 또는 초록색(담즙) 구토, 피 섞인 변",
    desc: "장중첩증이나 유문협착증 등 외과적 응급 질환일 수 있습니다.",
    level: "HIGH"
  }
];
