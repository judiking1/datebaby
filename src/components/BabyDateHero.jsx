"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Clock,
  RotateCcw
} from "lucide-react";
import { formatKoreanDate, formatISODate } from "@/lib/dateUtils";

export const MILESTONE_JUMPS = [
  { label: "생후 1일", days: 0 },
  { label: "50일", days: 50 },
  { label: "100일", days: 100 },
  { label: "6개월", days: 180 },
  { label: "돌 (12개월)", days: 365 },
  { label: "두 돌 (24개월)", days: 730 },
  { label: "세 돌 (36개월)", days: 1095 }
];

export const PREGNANCY_JUMPS = [
  { label: "4주 (착상)", week: 4 },
  { label: "7주 (입덧 절정)", week: 7 },
  { label: "12주 (1차 기형아)", week: 12 },
  { label: "16주 (성별/태동)", week: 16 },
  { label: "20주 (정밀 초음파)", week: 20 },
  { label: "24주 (임당 검사)", week: 24 },
  { label: "28주 (만삭 촬영)", week: 28 },
  { label: "32주 (아기 빨래)", week: 32 },
  { label: "36주 (막달 검사)", week: 36 },
  { label: "40주 (출산 D-Day)", week: 40 }
];

export default function BabyDateHero({
  profile,
  status,
  currentDate,
  onDateChange,
  onResetToday,
  isToday
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const handleJumpPregnancyWeek = (targetWeek) => {
    const due = new Date(profile.dueDate || new Date(Date.now() + 120 * 86400000));
    due.setHours(0, 0, 0, 0);
    // 임신 40주(280일) 기준, targetWeek에 해당하는 날짜 = dueDate - (40 - targetWeek) * 7일
    const daysBeforeDue = (40 - targetWeek) * 7;
    const targetDate = new Date(due);
    targetDate.setDate(targetDate.getDate() - daysBeforeDue);
    onDateChange(targetDate);
  };

  const handleJumpDays = (days) => {
    const birth = new Date(profile.birthDate || new Date());
    birth.setHours(0, 0, 0, 0);
    const target = new Date(birth);
    target.setDate(target.getDate() + days);
    onDateChange(target);
  };

  return (
    <section className="bg-linear-to-b from-amber-50/80 via-orange-50/40 to-white px-4 pt-4 pb-2 border-b border-amber-100/60">
      <div className="max-w-md mx-auto">
        {/* Main Status Card */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-400/90 via-orange-400/85 to-rose-400/90 p-5 text-white shadow-lg shadow-orange-500/15">
          {/* Background Decorative Circles */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/15 blur-lg pointer-events-none" />

          {/* Top Row: D-Day Badge & Date */}
          <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide border border-white/30 text-white shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              {status.dDayText}
            </span>

            {isToday ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/20 px-2 py-0.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                오늘
              </span>
            ) : (
              <button
                onClick={onResetToday}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-white/25 hover:bg-white/35 active:scale-95 px-2.5 py-1 rounded-lg transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                오늘로 돌아가기
              </button>
            )}
          </div>

          {/* Center: Main Age & Stage */}
          <div className="my-2 relative z-10">
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-xs">
              {profile.name} {status.isPregnant ? "만나기까지" : "성장 기록"}
            </h2>
            <p className="text-base font-bold text-white/95 mt-0.5">
              {status.isPregnant ? status.gestationalText : status.displayAge}
            </p>
          </div>

          {/* Date Selector Row */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between relative z-10">
            <button
              onClick={handlePrevDay}
              className="flex items-center gap-1 text-xs font-bold text-white/90 hover:text-white bg-white/15 hover:bg-white/25 active:scale-95 px-2.5 py-1.5 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              어제
            </button>

            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 active:scale-95 px-3 py-1.5 rounded-xl border border-white/25 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              {formatKoreanDate(currentDate)}
            </button>

            <button
              onClick={handleNextDay}
              className="flex items-center gap-1 text-xs font-bold text-white/90 hover:text-white bg-white/15 hover:bg-white/25 active:scale-95 px-2.5 py-1.5 rounded-xl transition-all"
            >
              내일
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Hidden/Collapsible Date Input */}
          {showDatePicker && (
            <div className="mt-3 p-3 bg-white rounded-2xl shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-200">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                보고 싶은 날짜를 직접 선택하세요:
              </label>
              <input
                type="date"
                value={formatISODate(currentDate)}
                onChange={(e) => {
                  if (e.target.value) {
                    onDateChange(new Date(e.target.value));
                    setShowDatePicker(false);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* Quick Jump Chips (임신 모드) */}
        {profile.isPregnant && (
          <div className="mt-3 overflow-x-auto scrollbar-none flex items-center gap-1.5 pb-1">
            <span className="text-[11px] font-bold text-amber-700 shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              주차별 탐색:
            </span>
            {PREGNANCY_JUMPS.map((p) => {
              const isSelected = status.gestationalWeeks === p.week;
              return (
                <button
                  key={p.label}
                  onClick={() => handleJumpPregnancyWeek(p.week)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold active:scale-95 transition-all shadow-2xs ${
                    isSelected
                      ? "bg-amber-500 text-white border border-amber-600 font-bold"
                      : "bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200/80"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Jump Chips (출산 후 모드) */}
        {!profile.isPregnant && (
          <div className="mt-3 overflow-x-auto scrollbar-none flex items-center gap-1.5 pb-1">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              빠른 탐색:
            </span>
            {MILESTONE_JUMPS.map((m) => (
              <button
                key={m.label}
                onClick={() => handleJumpDays(m.days)}
                className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200/80 active:scale-95 transition-all shadow-2xs"
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
