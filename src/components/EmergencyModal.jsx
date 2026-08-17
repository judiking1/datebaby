"use client";

import React, { useState } from "react";
import {
  X,
  HeartPulse,
  Thermometer,
  Pill,
  AlertTriangle,
  Clock,
  PhoneCall,
  Info,
  CheckCircle2
} from "lucide-react";
import {
  FEVER_LEVELS,
  MEDICINE_TYPES,
  CROSS_DOSING_RULES,
  RED_FLAG_EMERGENCY_LIST
} from "@/data/emergencyData";

export default function EmergencyModal({ isOpen, onClose, profile }) {
  const [activeTab, setActiveTab] = useState("calculator"); // 'calculator' | 'fever' | 'redflags'
  const [weight, setWeight] = useState(profile?.weight ? String(profile.weight) : "8.0");
  const numWeight = parseFloat(weight) || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-[680px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-rose-200">
        {/* Modal Header */}
        <div className="p-4 bg-linear-to-r from-rose-600 to-red-600 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">소아 응급 SOS & 해열제 계산기</h3>
              <p className="text-[11px] text-rose-200">
                체온별 대처법 • 체중별 정확한 투약 용량
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "calculator"
                ? "bg-white text-rose-700 shadow-xs border border-rose-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            해열제 용량 계산
          </button>
          <button
            onClick={() => setActiveTab("fever")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "fever"
                ? "bg-white text-rose-700 shadow-xs border border-rose-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            체온별 행동요령
          </button>
          <button
            onClick={() => setActiveTab("redflags")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "redflags"
                ? "bg-white text-rose-700 shadow-xs border border-rose-100"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            응급실 위험징후
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {/* TAB 1: Antipyretic Calculator */}
          {activeTab === "calculator" && (
            <div className="space-y-4">
              {/* Weight Input Box */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  ⚖️ 아기의 현재 몸무게 (kg):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="35"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    placeholder="예: 7.5"
                  />
                  <span className="font-bold text-sm text-slate-600">kg</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  * 해열제는 나이가 아닌 **정확한 체중(kg)** 기준으로 먹여야 안전합니다.
                </p>
              </div>

              {/* Calculated Results */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-rose-500" />
                  계열별 1회 권장 투약량 ({numWeight > 0 ? `${numWeight}kg 기준` : "몸무게 입력 필요"})
                </h4>

                {MEDICINE_TYPES.map((med) => {
                  const minDose = (numWeight * med.dosagePerKgMin).toFixed(1);
                  const maxDose = (numWeight * med.dosagePerKgMax).toFixed(1);

                  return (
                    <div
                      key={med.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">
                          {med.name}
                        </span>
                        <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                          1회 {minDose} ~ {maxDose} ml
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {med.brandExamples}
                      </p>
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>⏱️ 복용 간격: {med.intervalHours}</span>
                        <span>최대 하루 {med.maxTimesPerDay}회</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cross-Dosing Rules */}
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-1.5 text-amber-950">
                <h5 className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Clock className="w-4 h-4 text-amber-700" />
                  해열제 교차복용 절대 수칙
                </h5>
                <ul className="space-y-1 text-[11px] leading-relaxed">
                  <li>• {CROSS_DOSING_RULES.rule1}</li>
                  <li>• {CROSS_DOSING_RULES.rule2}</li>
                  <li className="font-bold text-rose-700">• {CROSS_DOSING_RULES.rule3}</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Fever Temperature Guide */}
          {activeTab === "fever" && (
            <div className="space-y-3">
              {FEVER_LEVELS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">
                      {item.range}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
                    {item.action}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Red Flags (Emergency Room) */}
          {activeTab === "redflags" && (
            <div className="space-y-3">
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs text-rose-950 space-y-1">
                <p className="font-bold text-rose-900 flex items-center gap-1">
                  🚨 다음 증상이 있으면 지체 없이 119 또는 응급실로 가세요!
                </p>
                <p className="text-[11px] text-rose-800">
                  특히 생후 100일 미만 신생아의 발열은 자가 투약하지 마시고 병원 진료가 필수입니다.
                </p>
              </div>

              {RED_FLAG_EMERGENCY_LIST.map((rf, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-rose-900">
                      • {rf.title}
                    </h5>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white">
                      {rf.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-3 leading-relaxed">
                    {rf.desc}
                  </p>
                </div>
              ))}

              <a
                href="tel:119"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all mt-2"
              >
                <PhoneCall className="w-4 h-4" />
                119 응급 상담 바로 전화하기
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
