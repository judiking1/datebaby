"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  Sparkles,
  Info,
  Scale,
  Ruler,
  ChevronRight,
  Award
} from "lucide-react";
import { GROWTH_STANDARDS, calculatePercentile } from "@/data/growthData";
import { syncFamilyToCloud } from "@/lib/firebase";

export default function GrowthCurveSection({ profile, status, onAskAI }) {
  const [chartType, setChartType] = useState("weight"); // 'weight' | 'height'
  const [gender, setGender] = useState(profile?.gender === "boy" ? "boy" : "girl");
  const [targetMonth, setTargetMonth] = useState(
    status?.months !== undefined ? Math.min(24, Math.max(0, status.months)) : 3
  );
  const [weightInput, setWeightInput] = useState(
    profile?.weight ? String(profile.weight) : "6.8"
  );
  const [heightInput, setHeightInput] = useState("64.0");

  useEffect(() => {
    if (status?.months !== undefined) {
      setTargetMonth(Math.min(24, Math.max(0, status.months)));
    }
    if (profile?.gender) {
      setGender(profile.gender === "boy" ? "boy" : "girl");
    }
    if (profile?.weight) {
      setWeightInput(String(profile.weight));
    }
  }, [profile, status]);

  const weightResult = calculatePercentile(
    gender,
    "weight",
    targetMonth,
    parseFloat(weightInput) || 6.8
  );

  const heightResult = calculatePercentile(
    gender,
    "height",
    targetMonth,
    parseFloat(heightInput) || 62.0
  );

  const activeResult = chartType === "weight" ? weightResult : heightResult;
  const activeValue = chartType === "weight" ? parseFloat(weightInput) : parseFloat(heightInput);
  const activeUnit = chartType === "weight" ? "kg" : "cm";

  // SVG Chart Dimensions & Data
  const dataset = GROWTH_STANDARDS[gender][chartType];
  const chartWidth = 320;
  const chartHeight = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };

  const maxMonth = 24;
  const minVal = chartType === "weight" ? 2 : 44;
  const maxVal = chartType === "weight" ? 17 : 98;

  const getX = (m) =>
    padding.left + (m / maxMonth) * (chartWidth - padding.left - padding.right);
  const getY = (v) =>
    chartHeight -
    padding.bottom -
    ((v - minVal) / (maxVal - minVal)) * (chartHeight - padding.top - padding.bottom);

  // SVG path generation for percentiles
  const p3Points = dataset.map((d) => `${getX(d.month)},${getY(d.p3)}`).join(" ");
  const p97Points = dataset.map((d) => `${getX(d.month)},${getY(d.p97)}`).join(" ");
  const p50Points = dataset.map((d) => `${getX(d.month)},${getY(d.p50)}`).join(" ");

  // Shaded area (p3 to p97)
  const p97ReversePoints = [...dataset]
    .reverse()
    .map((d) => `${getX(d.month)},${getY(d.p97)}`)
    .join(" ");
  const areaPath = `M ${dataset.map((d) => `${getX(d.month)},${getY(d.p3)}`).join(" L ")} L ${p97ReversePoints} Z`;

  const babyX = getX(targetMonth);
  const babyY = getY(activeValue);

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4">
      {/* 1. Header Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                질병관리청 표준 성장곡선
              </h3>
              <p className="text-[11px] text-slate-500">
                대한민국 2017 소아청소년 표준 백분위수 분석
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            KDCA 공인
          </span>
        </div>

        {/* Gender & Month Selectors */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Gender */}
          <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 flex gap-1">
            <button
              onClick={() => setGender("girl")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                gender === "girl"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              공주님 (여아)
            </button>
            <button
              onClick={() => setGender("boy")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                gender === "boy"
                  ? "bg-blue-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              왕자님 (남아)
            </button>
          </div>

          {/* Month */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 shrink-0">월령:</span>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(Number(e.target.value))}
              className="w-full bg-transparent font-bold text-xs text-slate-800 focus:outline-hidden"
            >
              {Array.from({ length: 25 }).map((_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? "신생아 (0개월)" : `생후 ${i}개월`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-2">
          {/* Weight */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
            <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              아기 몸무게
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                min="2"
                max="25"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-amber-300 rounded-lg text-center font-black text-sm text-slate-800"
              />
              <span className="text-xs font-bold text-amber-800">kg</span>
            </div>
          </div>

          {/* Height */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-1">
            <label className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-blue-600" />
              아기 신장 (키)
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.5"
                min="40"
                max="110"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-blue-300 rounded-lg text-center font-black text-sm text-slate-800"
              />
              <span className="text-xs font-bold text-blue-800">cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Percentile Result Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
            <Award className="w-4 h-4 text-amber-500" />
            우리 아기 성장 백분위 결과
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${activeResult.statusColor}`}
          >
            {activeResult.statusText}
          </span>
        </div>

        {/* Big Rank Highlight */}
        <div className="p-4 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-center space-y-1">
          <p className="text-xs text-amber-800 font-medium">
            생후 {targetMonth}개월 {gender === "boy" ? "남아" : "여아"} 100명 중
          </p>
          <div className="text-2xl font-black text-slate-900">
            앞에서 <span className="text-amber-600">{activeResult.rankFromFront}번째</span> (상위{" "}
            <span className="text-amber-600">{activeResult.percentile}%</span>)
          </div>
          <p className="text-[11px] text-slate-500">
            {chartType === "weight" ? "몸무게 기준" : "신장(키) 기준"} • 또래 평균(50%)은{" "}
            <strong className="text-slate-800">
              {activeResult.standard.p50}
              {activeUnit}
            </strong>
            입니다.
          </p>
        </div>

        {/* Percentile Distribution Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>하위 3% (작음)</span>
            <span>중앙값 50% (평균)</span>
            <span>상위 97% (큼)</span>
          </div>
          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-[3%] right-[3%] bg-linear-to-r from-blue-200 via-emerald-200 to-amber-200" />
            <div
              className="absolute top-0 bottom-0 w-3 bg-slate-900 rounded-full -ml-1.5 shadow-sm ring-2 ring-white transition-all duration-300"
              style={{ left: `${Math.min(98, Math.max(2, activeResult.percentile))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Interactive SVG Growth Chart */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        {/* Chart Type Tabs */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">월령별 표준 성장 곡선 그래프</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartType("weight")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                chartType === "weight"
                  ? "bg-white text-amber-600 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              체중 (kg)
            </button>
            <button
              onClick={() => setChartType("height")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                chartType === "height"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              신장 (cm)
            </button>
          </div>
        </div>

        {/* SVG Container */}
        <div className="w-full flex justify-center bg-slate-50/80 rounded-2xl p-2 border border-slate-100">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full max-w-[340px] h-auto overflow-visible"
          >
            {/* Grid Lines */}
            {[0, 6, 12, 18, 24].map((m) => (
              <g key={m}>
                <line
                  x1={getX(m)}
                  y1={padding.top}
                  x2={getX(m)}
                  y2={chartHeight - padding.bottom}
                  stroke="#e2e8f0"
                  strokeDasharray="2,2"
                />
                <text
                  x={getX(m)}
                  y={chartHeight - padding.bottom + 14}
                  fontSize="9"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontWeight="600"
                >
                  {m}M
                </text>
              </g>
            ))}

            {/* Shaded Corridor (3% ~ 97%) */}
            <path d={areaPath} fill="#fef3c7" opacity="0.6" />

            {/* Median Line (50%) */}
            <polyline
              points={dataset.map((d) => `${getX(d.month)},${getY(d.p50)}`).join(" ")}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />

            {/* Top 97% Line */}
            <polyline
              points={dataset.map((d) => `${getX(d.month)},${getY(d.p97)}`).join(" ")}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="3,3"
            />

            {/* Bottom 3% Line */}
            <polyline
              points={dataset.map((d) => `${getX(d.month)},${getY(d.p3)}`).join(" ")}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="3,3"
            />

            {/* Baby Point Marker */}
            <circle
              cx={babyX}
              cy={babyY}
              r="6"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="2"
              className="animate-pulse"
            />

            <text
              x={babyX}
              y={babyY - 10}
              fontSize="10"
              textAnchor="middle"
              fill="#ef4444"
              fontWeight="800"
            >
              {activeValue}
              {activeUnit}
            </text>
          </svg>
        </div>

        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>표준 50% 평균</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300" />
            <span>표준 범위 (3~97%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>우리 아기 위치</span>
          </div>
        </div>
      </div>

      {/* 4. Ask AI Doctor Bebe */}
      {onAskAI && (
        <button
          onClick={() =>
            onAskAI(
              `우리 아기(생후 ${targetMonth}개월 ${gender === "boy" ? "남아" : "여아"})의 체중은 ${weightInput}kg(상위 ${weightResult.percentile}%), 신장은 ${heightInput}cm(상위 ${heightResult.percentile}%)입니다. 현재 질병관리청 표준 성장 발달 관점에서 건강 상태와 영양 섭취 조언을 알려주세요.`
            )
          }
          className="w-full p-3.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-md active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>질병관리청 백분위 기반 AI 닥터 베베 성장 상담</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
