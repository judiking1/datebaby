// logUtils.js - 데일리 육아 기록 (수유, 수면, 기저귀, 이유식, 체온) 데이터 관리 및 통계

export const LOG_TYPES = {
  BOTTLE: { id: "bottle", label: "분유/유축", emoji: "🍼", unit: "ml", color: "amber" },
  BREAST: { id: "breast", label: "모유 수유", emoji: "🤱", unit: "분", color: "rose" },
  FOOD: { id: "food", label: "이유식", emoji: "🥣", unit: "g", color: "orange" },
  SLEEP: { id: "sleep", label: "수면", emoji: "😴", unit: "분", color: "indigo" },
  DIAPER_PEE: { id: "diaper_pee", label: "소변", emoji: "💧", color: "blue" },
  DIAPER_POOP: { id: "diaper_poop", label: "대변", emoji: "💩", color: "amber" },
  DIAPER_BOTH: { id: "diaper_both", label: "소변+대변", emoji: "🌟", color: "purple" },
  TEMP: { id: "temp", label: "체온/투약", emoji: "🌡️", unit: "℃", color: "rose" },
  BATH: { id: "bath", label: "목욕", emoji: "🛁", color: "cyan" }
};

const STORAGE_KEY = "datebaby_daily_logs";

/**
 * 전체 로그 불러오기
 */
export function getAllLogs() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

/**
 * 로그 목록 저장
 */
export function saveAllLogs(logs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {}
}

/**
 * 새 로그 추가
 */
export function addLogItem(item) {
  const logs = getAllLogs();
  const newItem = {
    id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    timestamp: item.timestamp || new Date().toISOString(),
    type: item.type, // 'bottle' | 'breast' | 'food' | 'sleep' | 'diaper_pee' | 'diaper_poop' | 'diaper_both' | 'temp' | 'bath'
    amount: item.amount || 0,
    durationMinutes: item.durationMinutes || 0,
    breastLeftMinutes: item.breastLeftMinutes || 0,
    breastRightMinutes: item.breastRightMinutes || 0,
    temperature: item.temperature || null,
    medicationName: item.medicationName || "",
    note: item.note || "",
    createdAt: new Date().toISOString()
  };

  const updated = [newItem, ...logs];
  saveAllLogs(updated);
  return updated;
}

/**
 * 로그 삭제
 */
export function removeLogItem(id) {
  const logs = getAllLogs();
  const updated = logs.filter((l) => l.id !== id);
  saveAllLogs(updated);
  return updated;
}

/**
 * 특정 날짜(YYYY-MM-DD)의 로그 필터링
 */
export function getLogsByDate(logs, dateStr) {
  if (!Array.isArray(logs)) return [];
  return logs.filter((l) => {
    const logDateStr = (l.timestamp || l.createdAt || "").split("T")[0];
    return logDateStr === dateStr;
  });
}

/**
 * 오늘 하루의 통계 요약 (총 분유량, 모유 수유 시간, 총 수면 시간, 기저귀 횟수, 마지막 수유 후 경과 시간)
 */
export function getDaySummary(logs, targetDateStr = null) {
  const todayStr = targetDateStr || new Date().toISOString().split("T")[0];
  const dayLogs = getLogsByDate(logs, todayStr);

  let totalBottleMl = 0;
  let totalBreastMinutes = 0;
  let totalFoodG = 0;
  let totalSleepMinutes = 0;
  let peeCount = 0;
  let poopCount = 0;

  dayLogs.forEach((l) => {
    if (l.type === "bottle") totalBottleMl += Number(l.amount) || 0;
    if (l.type === "breast") {
      totalBreastMinutes +=
        (Number(l.breastLeftMinutes) || 0) + (Number(l.breastRightMinutes) || 0) ||
        Number(l.durationMinutes) ||
        0;
    }
    if (l.type === "food") totalFoodG += Number(l.amount) || 0;
    if (l.type === "sleep") totalSleepMinutes += Number(l.durationMinutes) || 0;
    if (l.type === "diaper_pee") peeCount++;
    if (l.type === "diaper_poop") poopCount++;
    if (l.type === "diaper_both") {
      peeCount++;
      poopCount++;
    }
  });

  // 전체 로그에서 가장 최근 수유, 수면, 기저귀 찾기
  const sortedAll = [...logs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const lastFeeding = sortedAll.find(
    (l) => l.type === "bottle" || l.type === "breast" || l.type === "food"
  );
  const lastSleep = sortedAll.find((l) => l.type === "sleep");
  const lastDiaper = sortedAll.find((l) => l.type.startsWith("diaper"));

  const now = Date.now();

  const getDiffText = (item) => {
    if (!item) return "기록 없음";
    const diffMs = Math.max(0, now - new Date(item.timestamp).getTime());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}일 전`;
    if (hours > 0) return `${hours}시간 ${mins}분 전`;
    return `${mins}분 전`;
  };

  return {
    todayStr,
    totalBottleMl,
    totalBreastMinutes,
    totalFoodG,
    totalSleepMinutes,
    sleepHoursText: `${Math.floor(totalSleepMinutes / 60)}시간 ${totalSleepMinutes % 60}분`,
    peeCount,
    poopCount,
    diaperTotal: peeCount + poopCount,
    lastFeeding,
    lastFeedingDiffText: getDiffText(lastFeeding),
    lastSleep,
    lastSleepDiffText: getDiffText(lastSleep),
    lastDiaper,
    lastDiaperDiffText: getDiffText(lastDiaper),
    dayLogsCount: dayLogs.length
  };
}
