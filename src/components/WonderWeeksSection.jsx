"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Layers,
  Wind,
  HeartCrack,
  Boxes,
  GitCommit,
  Workflow,
  Scale,
  Crown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock
} from "lucide-react";
import {
  WONDER_WEEKS_LEAPS,
  getCurrentWonderWeekStatus
} from "@/data/wonderWeeksData";

const ICON_MAP = {
  Sparkles,
  Layers,
  Wind,
  Zap,
  HeartCrack,
  Boxes,
  GitCommit,
  Workflow,
  Scale,
  Crown
};

export default function WonderWeeksSection({ status, profile }) {
  const daysSinceBirth = status?.daysSinceBirth ?? 0;
  const wonderStatus = getCurrentWonderWeekStatus(daysSinceBirth);
  const [expandedLeap, setExpandedLeap] = useState(
    wonderStatus.activeLeap ? wonderStatus.activeLeap.leapNumber : (wonderStatus.upcomingLeap ? wonderStatus.upcomingLeap.leapNumber : 1)
  );

  return (
    <section className="px-4 py-3 max-w-md mx-auto space-y-4">
      {/* Header & Current Status */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            원더윅스 (도약기 & 보챔기)
          </span>
          {wonderStatus.isLeap ? (
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
              🔥 도약기 진행 중
            </span>
          ) : (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              🌿 안정기 (폭풍 전야)
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-800 mt-2 leading-snug">
          {wonderStatus.statusText}
        </h3>

        {/* If Active Leap is running */}
        {wonderStatus.activeLeap && (
          <div className="mt-3 p-3.5 bg-purple-50/70 rounded-2xl border border-purple-100 text-xs space-y-2">
            <div className="flex items-center justify-between text-purple-900 font-bold">
              <span>제{wonderStatus.activeLeap.leapNumber}도약: {wonderStatus.activeLeap.title}</span>
              <span>보챔 강도: {"⚡".repeat(wonderStatus.activeLeap.fussyLevel)}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-purple-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${wonderStatus.progressPercent || 50}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-purple-700">
              <span>생후 {wonderStatus.activeLeap.startDay}일차 시작</span>
              <span>종료까지 약 {wonderStatus.daysRemaining}일 남음</span>
            </div>
          </div>
        )}

        {/* If in calm state, show next leap info */}
        {!wonderStatus.isLeap && wonderStatus.upcomingLeap && (
          <div className="mt-3 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
              D-{wonderStatus.daysToNext}
            </div>
            <div>
              <p className="font-bold text-emerald-900">
                다음 도약: 제{wonderStatus.upcomingLeap.leapNumber}도약 ({wonderStatus.upcomingLeap.title})
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                생후 약 {wonderStatus.upcomingLeap.startDay}일경 (약 {wonderStatus.upcomingLeap.startWeek}주차) 시작 예정
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 10 Leaps Master Timeline & Accordion */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          생후 20개월까지 10대 도약기 백과
        </h4>
        <p className="text-xs text-slate-500">
          원더윅스는 아기의 뇌 신경망이 재구성되는 시기로, 극심한 보챔 후에는 반드시 눈부신 새 능력을 얻게 됩니다.
        </p>

        <div className="space-y-2 mt-2">
          {WONDER_WEEKS_LEAPS.map((leap) => {
            const isExpanded = expandedLeap === leap.leapNumber;
            const IconComp = ICON_MAP[leap.icon] || Sparkles;
            const isCurrent =
              wonderStatus.activeLeap?.leapNumber === leap.leapNumber;
            const isPast = daysSinceBirth > leap.endDay;

            return (
              <div
                key={leap.leapNumber}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isCurrent
                    ? "border-purple-300 bg-purple-50/40 shadow-xs"
                    : isPast
                    ? "border-slate-200 bg-slate-50/50 opacity-80"
                    : "border-slate-200 bg-white"
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() =>
                    setExpandedLeap(isExpanded ? null : leap.leapNumber)
                  }
                  className="w-full p-3.5 flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCurrent
                          ? "bg-purple-600 text-white shadow-xs"
                          : isPast
                          ? "bg-slate-200 text-slate-600"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {leap.leapNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800">
                          제{leap.leapNumber}도약: {leap.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-purple-600 text-white">
                            NOW
                          </span>
                        )}
                        {isPast && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-600">
                            완료
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        생후 {leap.startWeek}주차 전후 (D+{leap.startDay}~{leap.endDay}일) • 보챔: {"⚡".repeat(leap.fussyLevel)}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-purple-100/60 text-xs space-y-3 bg-white/70 animate-in fade-in duration-200">
                    {/* Subtitle */}
                    <p className="font-bold text-purple-900 bg-purple-100/50 p-2 rounded-xl">
                      💬 "{leap.subtitle}"
                    </p>

                    {/* Baby's Mind */}
                    <div>
                      <h5 className="font-bold text-slate-700 flex items-center gap-1 mb-1">
                        🧠 아기의 마음 상태
                      </h5>
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
                        {leap.babyFeeling}
                      </p>
                    </div>

                    {/* Symptoms */}
                    <div>
                      <h5 className="font-bold text-rose-700 flex items-center gap-1 mb-1">
                        😭 주요 보챔 증상
                      </h5>
                      <ul className="space-y-1 text-slate-600 pl-1">
                        {leap.symptoms.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-500">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* New Skills */}
                    <div>
                      <h5 className="font-bold text-emerald-700 flex items-center gap-1 mb-1">
                        ✨ 도약 후 얻는 새로운 능력
                      </h5>
                      <ul className="space-y-1 text-slate-600 pl-1">
                        {leap.newSkills.map((sk, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500">✓</span>
                            <span>{sk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Parent Survival Tips */}
                    <div>
                      <h5 className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                        🛡️ 부모를 위한 대처 꿀팁
                      </h5>
                      <ul className="space-y-1 text-slate-600 pl-1 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                        {leap.parentTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">👉</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
