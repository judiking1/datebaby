"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Info,
  Syringe,
  Filter
} from "lucide-react";
import { getVaccineStatusList, VACCINE_SCHEDULE } from "@/data/vaccineData";
import { syncFamilyToCloud } from "@/lib/firebase";

const STORAGE_KEY = "datebaby_completed_vaccines";

export default function VaccineSection({ profile, onAskAI }) {
  const [completedVaccines, setCompletedVaccines] = useState({});
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'due' | 'upcoming' | 'completed'

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCompletedVaccines(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const handleToggleVaccine = (id) => {
    const isDone = !!completedVaccines[id];
    const updated = { ...completedVaccines };

    if (isDone) {
      delete updated[id];
    } else {
      updated[id] = {
        date: new Date().toISOString().split("T")[0],
        completedAt: new Date().toISOString()
      };
    }

    setCompletedVaccines(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    // Sync to Cloud
    if (profile?.familyCode) {
      syncFamilyToCloud(profile.familyCode, { completedVaccines: updated });
    }
  };

  const birthDate = profile?.birthDate || "2026-05-20";
  const vaccineList = getVaccineStatusList(birthDate, completedVaccines);

  const completedCount = Object.keys(completedVaccines).length;
  const totalCount = VACCINE_SCHEDULE.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const dueList = vaccineList.filter((v) => v.statusType === "due" || v.statusType === "overdue");
  const upcomingList = vaccineList.filter((v) => v.statusType === "upcoming");
  const completedList = vaccineList.filter((v) => v.statusType === "completed");

  const displayList =
    activeFilter === "due"
      ? dueList
      : activeFilter === "upcoming"
      ? upcomingList
      : activeFilter === "completed"
      ? completedList
      : vaccineList;

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4">
      {/* 1. Progress Header Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                국가필수 예방접종(NIP) 캘린더
              </h3>
              <p className="text-[11px] text-slate-500">
                생년월일({birthDate}) 기준 권장 일정 & D-Day
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
            {completedCount}/{totalCount} 완료 ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-linear-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Due Alert */}
        {dueList.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              현재 접종 권장 시기인 백신이 <strong>{dueList.length}건</strong> 있습니다. 소아과 방문 일정을 확인하세요!
            </span>
          </div>
        )}
      </div>

      {/* 2. Filter Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex gap-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "all"
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          전체 ({vaccineList.length})
        </button>
        <button
          onClick={() => setActiveFilter("due")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "due"
              ? "bg-amber-500 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          접종 필요 ({dueList.length})
        </button>
        <button
          onClick={() => setActiveFilter("upcoming")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "upcoming"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          예정 ({upcomingList.length})
        </button>
        <button
          onClick={() => setActiveFilter("completed")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "completed"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          완료 ({completedList.length})
        </button>
      </div>

      {/* 3. Vaccine Cards List */}
      <div className="space-y-3">
        {displayList.map((v) => {
          const isDone = v.isCompleted;

          return (
            <div
              key={v.id}
              className={`p-4 rounded-3xl border transition-all ${
                isDone
                  ? "bg-emerald-50/40 border-emerald-200 shadow-2xs"
                  : v.statusType === "due" || v.statusType === "overdue"
                  ? "bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/30 shadow-xs"
                  : "bg-white border-slate-200 shadow-2xs"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => handleToggleVaccine(v.id)}
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                        : "bg-slate-100 border border-slate-300 hover:border-slate-400 text-transparent"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4
                        className={`text-sm font-black ${
                          isDone ? "text-slate-500 line-through" : "text-slate-900"
                        }`}
                      >
                        {v.name}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {v.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{v.disease} 예방</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isDone
                      ? "bg-emerald-100 text-emerald-800"
                      : v.statusType === "overdue"
                      ? "bg-rose-100 text-rose-700"
                      : v.statusType === "due"
                      ? "bg-amber-100 text-amber-800 font-extrabold animate-pulse"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {v.statusBadge}
                </span>
              </div>

              {/* Recommended Date Window */}
              <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    권장 시기: {v.targetStartDateStr} ~ {v.targetEndDateStr}
                  </span>
                </div>
                {isDone && v.completedDate && (
                  <span className="text-emerald-700 font-bold">
                    접종일: {v.completedDate}
                  </span>
                )}
              </div>

              {/* Tips & Precautions */}
              <div className="mt-2 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                💡 <strong>안내:</strong> {v.tips}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Ask AI for Vaccine Fever & Scheduling */}
      {onAskAI && (
        <button
          onClick={() =>
            onAskAI(
              `우리 아기(생후 ${profile?.birthDate || "생후 일자 미입력"}) 예방접종 후 발열 시 대처법(접종열 vs 감염열 구분, 교차복용 기준)과 접종 전후 주의사항을 자세히 알려주세요.`
            )
          }
          className="w-full p-3.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-md active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>예방접종 후 열 관리 & 소아과 AI 닥터 베베 상담</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
