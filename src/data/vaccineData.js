// vaccineData.js - 질병관리청(KDCA) 국가필수예방접종(NIP) 표준 일정 데이터
// 아기 생년월일 기준 권장 접종 시기 및 접종 주의사항 포함

export const VACCINE_SCHEDULE = [
  {
    id: "hepb_1",
    name: "B형간염 1차",
    disease: "B형간염",
    targetMonthMin: 0,
    targetMonthMax: 0,
    targetDaysMin: 0,
    targetDaysMax: 7,
    description: "출생 직후 12시간 이내 1차 접종 권장",
    tag: "출생 직후",
    mandatory: true,
    tips: "분만 병원이나 산후조리원에서 퇴원 전 기본 접종됩니다."
  },
  {
    id: "bcg",
    name: "결핵(BCG)",
    disease: "결핵",
    targetMonthMin: 0,
    targetMonthMax: 1,
    targetDaysMin: 20,
    targetDaysMax: 30,
    description: "생후 4주(1개월) 이내 접종",
    tag: "생후 4주 이내",
    mandatory: true,
    tips: "피내용(보건소 무료) 또는 경피용(도장형) 중 선택하여 접종합니다."
  },
  {
    id: "hepb_2",
    name: "B형간염 2차",
    disease: "B형간염",
    targetMonthMin: 1,
    targetMonthMax: 1,
    targetDaysMin: 30,
    targetDaysMax: 45,
    description: "생후 1개월 접종 (1차 접종 후 1개월 뒤)",
    tag: "생후 1개월",
    mandatory: true,
    tips: "BCG 접종 시기에 맞춰 함께 접종하거나 간격을 두고 진행합니다."
  },
  {
    id: "dtap_1",
    name: "DTaP 1차",
    disease: "디프테리아·파상풍·백일해",
    targetMonthMin: 2,
    targetMonthMax: 2,
    targetDaysMin: 60,
    targetDaysMax: 75,
    description: "생후 2개월 기본 1차 접종 (5가/6가 혼합백신 가능)",
    tag: "생후 2개월",
    mandatory: true,
    tips: "생후 2개월에는 여러 접종이 겹치므로 소아과 예약 후 진행하세요."
  },
  {
    id: "ipv_1",
    name: "폴리오(IPV) 1차",
    disease: "소아마비",
    targetMonthMin: 2,
    targetMonthMax: 2,
    targetDaysMin: 60,
    targetDaysMax: 75,
    description: "생후 2개월 소아마비 예방 접종",
    tag: "생후 2개월",
    mandatory: true,
    tips: "최근에는 DTaP-IPV-Hib 혼합백신으로 1회 주사로 진행되기도 합니다."
  },
  {
    id: "hib_1",
    name: "b형헤모필루스인플루엔자(Hib) 1차",
    disease: "뇌수막염·후두염",
    targetMonthMin: 2,
    targetMonthMax: 2,
    targetDaysMin: 60,
    targetDaysMax: 75,
    description: "생후 2개월 뇌수막염 예방 접종",
    tag: "생후 2개월",
    mandatory: true,
    tips: "소아 세균성 뇌수막염의 주원인균을 예방합니다."
  },
  {
    id: "pcv_1",
    name: "폐렴구균(PCV) 1차",
    disease: "폐렴·패혈증·중이염",
    targetMonthMin: 2,
    targetMonthMax: 2,
    targetDaysMin: 60,
    targetDaysMax: 75,
    description: "생후 2개월 1차 접종",
    tag: "생후 2개월 (열 주의)",
    mandatory: true,
    tips: "접종 후 미열이나 보챔이 흔하므로 체온계와 상비 해열제를 미리 준비하세요."
  },
  {
    id: "rota_1",
    name: "로타바이러스 1차",
    disease: "로타바이러스 장염",
    targetMonthMin: 2,
    targetMonthMax: 2,
    targetDaysMin: 60,
    targetDaysMax: 75,
    description: "경구 투여(먹는 약) 1차",
    tag: "생후 2개월 (경구약)",
    mandatory: true,
    tips: "먹는 약이므로 수유 후 1시간 이상 지나 배고플 때 방문하면 잘 먹습니다."
  },
  {
    id: "dtap_combo_2",
    name: "DTaP / IPV / Hib 2차",
    disease: "디프테리아·파상풍·백일해·소아마비·Hib",
    targetMonthMin: 4,
    targetMonthMax: 4,
    targetDaysMin: 120,
    targetDaysMax: 135,
    description: "생후 4개월 기본 2차 접종",
    tag: "생후 4개월",
    mandatory: true,
    tips: "1차 접종 후 2개월 간격을 지켜 접종합니다."
  },
  {
    id: "pcv_2",
    name: "폐렴구균(PCV) 2차",
    disease: "폐렴·중이염",
    targetMonthMin: 4,
    targetMonthMax: 4,
    targetDaysMin: 120,
    targetDaysMax: 135,
    description: "생후 4개월 2차 접종",
    tag: "생후 4개월",
    mandatory: true,
    tips: "1차와 동일한 제제(PCV13 또는 PCV15 등)로 접종하는 것이 원칙입니다."
  },
  {
    id: "rota_2",
    name: "로타바이러스 2차",
    disease: "로타 장염",
    targetMonthMin: 4,
    targetMonthMax: 4,
    targetDaysMin: 120,
    targetDaysMax: 135,
    description: "경구 투여 2차 접종",
    tag: "생후 4개월",
    mandatory: true,
    tips: "로타릭스(2회 완료) 또는 로타텍(3회 완료) 스케줄을 확인하세요."
  },
  {
    id: "hepb_3",
    name: "B형간염 3차",
    disease: "B형간염",
    targetMonthMin: 6,
    targetMonthMax: 6,
    targetDaysMin: 180,
    targetDaysMax: 200,
    description: "생후 6개월 접종으로 기본 면역 완료",
    tag: "생후 6개월",
    mandatory: true,
    tips: "B형간염 기초 3회 접종의 마지막 단계입니다."
  },
  {
    id: "dtap_combo_3",
    name: "DTaP / IPV / Hib 3차",
    disease: "디프테리아·파상풍·백일해·소아마비·Hib",
    targetMonthMin: 6,
    targetMonthMax: 6,
    targetDaysMin: 180,
    targetDaysMax: 200,
    description: "생후 6개월 3차 접종",
    tag: "생후 6개월",
    mandatory: true,
    tips: "6개월 차 접종을 마치면 돌(12개월)까지 긴 휴식기를 갖습니다."
  },
  {
    id: "pcv_3",
    name: "폐렴구균(PCV) 3차",
    disease: "폐렴·중이염",
    targetMonthMin: 6,
    targetMonthMax: 6,
    targetDaysMin: 180,
    targetDaysMax: 200,
    description: "생후 6개월 3차 접종",
    tag: "생후 6개월",
    mandatory: true,
    tips: "3차 접종 후 다음 4차는 만 12~15개월에 진행합니다."
  },
  {
    id: "mmr_1",
    name: "MMR 1차",
    disease: "홍역·유행성이하선염(볼거리)·풍진",
    targetMonthMin: 12,
    targetMonthMax: 15,
    targetDaysMin: 365,
    targetDaysMax: 450,
    description: "생후 12~15개월 돌 접종",
    tag: "돌(12~15개월)",
    mandatory: true,
    tips: "돌 지난 후 가장 먼저 맞는 필수 백신 중 하나입니다."
  },
  {
    id: "var_1",
    name: "수두 1차",
    disease: "수두",
    targetMonthMin: 12,
    targetMonthMax: 15,
    targetDaysMin: 365,
    targetDaysMax: 450,
    description: "생후 12~15개월 1회 접종",
    tag: "돌(12~15개월)",
    mandatory: true,
    tips: "MMR과 같은 날 동시 접종이 가능합니다."
  },
  {
    id: "hepa_1",
    name: "A형간염 1차",
    disease: "A형간염",
    targetMonthMin: 12,
    targetMonthMax: 23,
    targetDaysMin: 365,
    targetDaysMax: 700,
    description: "생후 12~23개월 1차 (2차는 6~18개월 뒤)",
    tag: "12~23개월",
    mandatory: true,
    tips: "총 2회 접종으로 영구 면역을 획득합니다."
  },
  {
    id: "je_1",
    name: "일본뇌염 1차",
    disease: "일본뇌염",
    targetMonthMin: 12,
    targetMonthMax: 23,
    targetDaysMin: 365,
    targetDaysMax: 700,
    description: "사백신(총 5회) 또는 생백신(총 2회) 선택",
    tag: "12~23개월",
    mandatory: true,
    tips: "병원에서 사백신과 생백신 장단점을 상담 후 선택하세요."
  }
];

/**
 * 아기 생년월일 기준으로 각 백신의 권장 접종일 및 현재 D-Day 상태 계산
 */
export function getVaccineStatusList(birthDateStr, completedIds = {}) {
  if (!birthDateStr) return [];
  const birthDate = new Date(birthDateStr);
  const now = new Date();

  return VACCINE_SCHEDULE.map((v) => {
    const isCompleted = !!completedIds[v.id];
    const completedDate = completedIds[v.id]?.date || null;

    // 권장 시작일 및 권장 종료일 계산
    const targetStartDate = new Date(birthDate.getTime() + v.targetDaysMin * 86400000);
    const targetEndDate = new Date(birthDate.getTime() + v.targetDaysMax * 86400000);

    const diffDaysToStart = Math.ceil((targetStartDate - now) / 86400000);
    const diffDaysToEnd = Math.ceil((targetEndDate - now) / 86400000);

    let statusType = "upcoming"; // 'completed' | 'due' | 'overdue' | 'upcoming'
    let statusBadge = `D-${diffDaysToStart}`;

    if (isCompleted) {
      statusType = "completed";
      statusBadge = "접종 완료";
    } else if (diffDaysToEnd < 0) {
      statusType = "overdue";
      statusBadge = `접종 기간 경과 (+${Math.abs(diffDaysToEnd)}일)`;
    } else if (diffDaysToStart <= 0 && diffDaysToEnd >= 0) {
      statusType = "due";
      statusBadge = "지금 접종 권장";
    } else {
      statusType = "upcoming";
      statusBadge = `D-${diffDaysToStart}일 후`;
    }

    return {
      ...v,
      isCompleted,
      completedDate,
      targetStartDateStr: targetStartDate.toISOString().split("T")[0],
      targetEndDateStr: targetEndDate.toISOString().split("T")[0],
      statusType,
      statusBadge
    };
  });
}
