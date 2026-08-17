// dateUtils.js - 아기 날짜 및 월령 계산 유틸리티

/**
 * 날짜 문자열(YYYY-MM-DD) 또는 Date 객체를 YYYY-MM-DD 포맷으로 변환
 */
export function formatISODate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 한국어 날짜 포맷 (예: 2026년 8월 18일 화요일)
 */
export function formatKoreanDate(date) {
  const d = new Date(date);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

/**
 * 두 날짜 간의 일수 차이 계산 (target - base)
 */
export function getDaysDifference(baseDateStr, targetDateStr) {
  const base = new Date(baseDateStr);
  base.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - base.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 아기 상태 종합 계산기
 * @param {Object} profile { name, isPregnant, birthDate, dueDate, gender, weight }
 * @param {Date|string} currentDate 보고 있는 대상 날짜
 */
export function calculateBabyStatus(profile, currentDate = new Date()) {
  const target = new Date(currentDate);
  target.setHours(0, 0, 0, 0);
  const targetStr = formatISODate(target);

  const isPregnant = profile?.isPregnant ?? false;
  const dueDateStr = profile?.dueDate || formatISODate(new Date(Date.now() + 120 * 86400000));
  const birthDateStr = profile?.birthDate || dueDateStr;

  if (isPregnant) {
    // 임신 모드: 출산예정일 기준
    const daysUntilDue = getDaysDifference(targetStr, dueDateStr);
    // 임신 40주(280일) 기준 역산
    const gestationalDays = Math.max(0, Math.min(280, 280 - daysUntilDue));
    const weeks = Math.floor(gestationalDays / 7);
    const days = gestationalDays % 7;

    return {
      isPregnant: true,
      daysUntilDue, // 출산까지 남은 일수 (D-Day)
      dDayText: daysUntilDue > 0 ? `D-${daysUntilDue}` : daysUntilDue === 0 ? "D-Day (오늘 출산 예정!)" : `D+${Math.abs(daysUntilDue)} (예정일 초과)`,
      gestationalWeeks: weeks,
      gestationalDays: days,
      gestationalText: `임신 ${weeks}주 ${days}일차`,
      targetDateStr: targetStr,
      displayAge: `임신 ${weeks}주차`,
      totalDays: gestationalDays,
      referenceWeek: weeks,
    };
  } else {
    // 출산 후 모드: 생년월일 기준
    const daysSinceBirth = getDaysDifference(birthDateStr, targetStr);
    const dayCount = daysSinceBirth + 1; // 생후 1일차부터 시작 (태어난 날 = 1일)

    // 개월 수 계산
    const bDate = new Date(birthDateStr);
    let months = (target.getFullYear() - bDate.getFullYear()) * 12 + (target.getMonth() - bDate.getMonth());
    if (target.getDate() < bDate.getDate()) {
      months--;
    }
    months = Math.max(0, months);

    const weeks = Math.max(1, Math.floor(daysSinceBirth / 7) + 1);

    let dDayText = "";
    if (daysSinceBirth === 0) {
      dDayText = "생후 첫날 (D+1)";
    } else if (daysSinceBirth > 0) {
      dDayText = `생후 ${daysSinceBirth}일 (D+${daysSinceBirth})`;
    } else {
      dDayText = `출산 전 D-${Math.abs(daysSinceBirth)}`;
    }

    let displayAge = "";
    if (daysSinceBirth <= 30) {
      displayAge = `생후 ${Math.max(1, daysSinceBirth)}일 (신생아기)`;
    } else if (months < 12) {
      displayAge = `생후 ${months}개월 (${weeks}주차)`;
    } else {
      const years = Math.floor(months / 12);
      const remMonths = months % 12;
      displayAge = remMonths > 0 ? `만 ${years}세 ${remMonths}개월 (${months}개월)` : `만 ${years}세 (${months}개월)`;
    }

    return {
      isPregnant: false,
      daysSinceBirth: Math.max(0, daysSinceBirth),
      dayCount: Math.max(1, dayCount),
      months,
      weeks,
      dDayText,
      displayAge,
      targetDateStr: targetStr,
      totalDays: Math.max(0, daysSinceBirth),
      referenceWeek: weeks,
    };
  }
}
