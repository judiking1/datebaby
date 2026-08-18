"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  Trash2,
  Milk,
  Moon,
  Droplets,
  Utensils,
  Thermometer,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import {
  getAllLogs,
  addLogItem,
  removeLogItem,
  getDaySummary,
  getLogsByDate,
  LOG_TYPES
} from "@/lib/logUtils";
import { syncFamilyToCloud } from "@/lib/firebase";

export default function DailyLogSection({ profile, onAskAI }) {
  const [logs, setLogs] = useState([]);
  const [selectedType, setSelectedType] = useState("bottle"); // 'bottle' | 'breast' | 'sleep' | 'diaper' | 'food' | 'temp'
  const [targetDateStr, setTargetDateStr] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Input states
  const [bottleAmount, setBottleAmount] = useState(120);
  const [foodAmount, setFoodAmount] = useState(50);
  const [tempValue, setTempValue] = useState("36.8");
  const [tempNote, setTempNote] = useState("");
  const [sleepDuration, setSleepDuration] = useState(60);

  // Breastfeeding Timer
  const [breastSide, setBreastSide] = useState("left"); // 'left' | 'right'
  const [isBreastTimerRunning, setIsBreastTimerRunning] = useState(false);
  const [breastLeftSec, setBreastLeftSec] = useState(0);
  const [breastRightSec, setBreastRightSec] = useState(0);

  // Sleep Live Tracker
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState(null);
  const [sleepElapsedSec, setSleepElapsedSec] = useState(0);

  // Load logs on mount
  useEffect(() => {
    const loaded = getAllLogs();
    setLogs(loaded);
  }, []);

  // Breastfeeding stopwatch ticker
  useEffect(() => {
    let interval = null;
    if (isBreastTimerRunning) {
      interval = setInterval(() => {
        if (breastSide === "left") {
          setBreastLeftSec((prev) => prev + 1);
        } else {
          setBreastRightSec((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreastTimerRunning, breastSide]);

  // Sleep live ticker
  useEffect(() => {
    let interval = null;
    if (isSleeping && sleepStartTime) {
      interval = setInterval(() => {
        const sec = Math.floor((Date.now() - sleepStartTime) / 1000);
        setSleepElapsedSec(sec);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSleeping, sleepStartTime]);

  const handleAddLog = (data) => {
    const updated = addLogItem(data);
    setLogs(updated);

    // Sync with Firebase Firestore
    if (profile?.familyCode) {
      syncFamilyToCloud(profile.familyCode, { dailyLogs: updated });
    }
  };

  const handleDeleteLog = (id) => {
    if (confirm("이 기록을 삭제하시겠습니까?")) {
      const updated = removeLogItem(id);
      setLogs(updated);
      if (profile?.familyCode) {
        syncFamilyToCloud(profile.familyCode, { dailyLogs: updated });
      }
    }
  };

  // Submit Handlers
  const handleSaveBottle = () => {
    handleAddLog({
      type: "bottle",
      amount: Number(bottleAmount) || 0,
      note: `${bottleAmount}ml 수유 완료`
    });
  };

  const handleSaveBreast = () => {
    const leftMins = Math.round(breastLeftSec / 60);
    const rightMins = Math.round(breastRightSec / 60);
    const totalMins = leftMins + rightMins || 1;

    handleAddLog({
      type: "breast",
      durationMinutes: totalMins,
      breastLeftMinutes: leftMins,
      breastRightMinutes: rightMins,
      note: `좌 ${leftMins}분 / 우 ${rightMins}분 (총 ${totalMins}분)`
    });

    // Reset timer
    setIsBreastTimerRunning(false);
    setBreastLeftSec(0);
    setBreastRightSec(0);
  };

  const handleToggleSleep = () => {
    if (!isSleeping) {
      // Start sleep
      setIsSleeping(true);
      setSleepStartTime(Date.now());
      setSleepElapsedSec(0);
    } else {
      // End sleep
      const totalMins = Math.max(1, Math.round(sleepElapsedSec / 60));
      handleAddLog({
        type: "sleep",
        durationMinutes: totalMins,
        note: `수면 ${Math.floor(totalMins / 60)}시간 ${totalMins % 60}분`
      });
      setIsSleeping(false);
      setSleepStartTime(null);
      setSleepElapsedSec(0);
    }
  };

  const handleManualSleep = () => {
    handleAddLog({
      type: "sleep",
      durationMinutes: Number(sleepDuration) || 30,
      note: `수면 ${Math.floor(sleepDuration / 60)}시간 ${sleepDuration % 60}분`
    });
  };

  const handleSaveDiaper = (kind) => {
    handleAddLog({
      type: `diaper_${kind}`,
      note:
        kind === "pee"
          ? "소변 기저귀 교체"
          : kind === "poop"
          ? "대변 기저귀 교체"
          : "소변+대변 기저귀 교체"
    });
  };

  const handleSaveFood = () => {
    handleAddLog({
      type: "food",
      amount: Number(foodAmount) || 0,
      note: `이유식 ${foodAmount}g 섭취`
    });
  };

  const handleSaveTemp = () => {
    handleAddLog({
      type: "temp",
      temperature: Number(tempValue) || 36.8,
      note: tempNote ? `체온 ${tempValue}℃ (${tempNote})` : `체온 ${tempValue}℃`
    });
    setTempNote("");
  };

  const summary = getDaySummary(logs, targetDateStr);
  const dayLogs = getLogsByDate(logs, targetDateStr);

  const formatTimer = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4">
      {/* 1. Today Summary Cards */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="font-extrabold text-slate-800 text-sm">
              오늘 하루 육아 대시보드
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {targetDateStr}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Total Milk */}
          <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-amber-700 text-[11px] font-bold">
              <Milk className="w-3.5 h-3.5" />
              총 분유량
            </div>
            <div className="mt-1 text-lg font-black text-amber-900">
              {summary.totalBottleMl}
              <span className="text-xs font-semibold text-amber-700 ml-0.5">ml</span>
            </div>
            <div className="text-[10px] text-amber-600 mt-0.5">
              마지막 수유: {summary.lastFeedingDiffText}
            </div>
          </div>

          {/* Breast Feed */}
          <div className="bg-rose-50/80 border border-rose-200/80 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-rose-700 text-[11px] font-bold">
              <span>🤱</span>
              모유 수유
            </div>
            <div className="mt-1 text-lg font-black text-rose-900">
              {summary.totalBreastMinutes}
              <span className="text-xs font-semibold text-rose-700 ml-0.5">분</span>
            </div>
            <div className="text-[10px] text-rose-600 mt-0.5">좌/우 누적 시간</div>
          </div>

          {/* Sleep */}
          <div className="bg-indigo-50/80 border border-indigo-200/80 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-indigo-700 text-[11px] font-bold">
              <Moon className="w-3.5 h-3.5" />
              총 수면
            </div>
            <div className="mt-1 text-lg font-black text-indigo-900">
              {summary.sleepHoursText}
            </div>
            <div className="text-[10px] text-indigo-600 mt-0.5">
              마지막 잠: {summary.lastSleepDiffText}
            </div>
          </div>

          {/* Diaper */}
          <div className="bg-sky-50/80 border border-sky-200/80 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-sky-700 text-[11px] font-bold">
              <Droplets className="w-3.5 h-3.5" />
              기저귀
            </div>
            <div className="mt-1 text-lg font-black text-sky-900">
              {summary.diaperTotal}
              <span className="text-xs font-semibold text-sky-700 ml-0.5">회</span>
            </div>
            <div className="text-[10px] text-sky-600 mt-0.5">
              소변 {summary.peeCount} / 대변 {summary.poopCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Log Type Selector */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedType("bottle")}
          className={`flex-1 min-w-[64px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            selectedType === "bottle"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span className="text-base">🍼</span>
          <span>분유</span>
        </button>

        <button
          onClick={() => setSelectedType("breast")}
          className={`flex-1 min-w-[64px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            selectedType === "breast"
              ? "bg-rose-500 text-white shadow-xs"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span className="text-base">🤱</span>
          <span>모유</span>
        </button>

        <button
          onClick={() => setSelectedType("sleep")}
          className={`flex-1 min-w-[64px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            selectedType === "sleep"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span className="text-base">😴</span>
          <span>수면</span>
        </button>

        <button
          onClick={() => setSelectedType("diaper")}
          className={`flex-1 min-w-[64px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            selectedType === "diaper"
              ? "bg-sky-500 text-white shadow-xs"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span className="text-base">💧</span>
          <span>기저귀</span>
        </button>

        <button
          onClick={() => setSelectedType("food")}
          className={`flex-1 min-w-[64px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            selectedType === "food"
              ? "bg-orange-500 text-white shadow-xs"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span className="text-base">🥣</span>
          <span>이유식</span>
        </button>

        <button
          onClick={() => setSelectedType("temp")}
          className={`flex-1 min-w-[64px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            selectedType === "temp"
              ? "bg-red-500 text-white shadow-xs"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span className="text-base">🌡️</span>
          <span>체온</span>
        </button>
      </div>

      {/* 3. Action Panel based on selected type */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        {/* 분유 입력 */}
        {selectedType === "bottle" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">분유 / 유축 수유량 (ml)</span>
              <span className="text-xl font-black text-amber-600">{bottleAmount} ml</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBottleAmount((prev) => Math.max(10, prev - 20))}
                className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
              >
                -20
              </button>
              <input
                type="number"
                step="10"
                value={bottleAmount}
                onChange={(e) => setBottleAmount(Number(e.target.value))}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center font-black text-lg text-slate-800"
              />
              <button
                onClick={() => setBottleAmount((prev) => prev + 20)}
                className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
              >
                +20
              </button>
            </div>

            <div className="flex gap-1.5">
              {[80, 120, 160, 200, 240].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBottleAmount(preset)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    bottleAmount === preset
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {preset}ml
                </button>
              ))}
            </div>

            <button
              onClick={handleSaveBottle}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              {bottleAmount}ml 수유 기록 추가
            </button>
          </div>
        )}

        {/* 모유 타이머 */}
        {selectedType === "breast" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">모유 수유 좌/우 타이머</span>
              <span className="text-xs text-rose-600 font-bold">
                합계: {Math.round((breastLeftSec + breastRightSec) / 60)}분
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Left Breast */}
              <div
                onClick={() => setBreastSide("left")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  breastSide === "left"
                    ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="text-[11px] font-bold text-rose-800">왼쪽 가슴</div>
                <div className="text-xl font-black text-rose-900 mt-1">
                  {formatTimer(breastLeftSec)}
                </div>
              </div>

              {/* Right Breast */}
              <div
                onClick={() => setBreastSide("right")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  breastSide === "right"
                    ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="text-[11px] font-bold text-rose-800">오른쪽 가슴</div>
                <div className="text-xl font-black text-rose-900 mt-1">
                  {formatTimer(breastRightSec)}
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsBreastTimerRunning(!isBreastTimerRunning)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-white ${
                  isBreastTimerRunning
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isBreastTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    일시정지
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {breastSide === "left" ? "왼쪽 시작" : "오른쪽 시작"}
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsBreastTimerRunning(false);
                  setBreastLeftSec(0);
                  setBreastRightSec(0);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSaveBreast}
              disabled={breastLeftSec === 0 && breastRightSec === 0}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              모유 수유 기록 저장하기
            </button>
          </div>
        )}

        {/* 수면 */}
        {selectedType === "sleep" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">수면 타이머 & 직접 입력</span>
            </div>

            {/* Live Sleep Tracker */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center space-y-2">
              <div className="text-xs text-indigo-700 font-bold">
                {isSleeping ? "💤 아기가 곤히 자고 있어요..." : "아기가 잠들었나요?"}
              </div>
              <div className="text-2xl font-black text-indigo-950">
                {isSleeping ? formatTimer(sleepElapsedSec) : "00:00"}
              </div>

              <button
                onClick={handleToggleSleep}
                className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md text-white ${
                  isSleeping
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSleeping ? (
                  <>
                    <span>☀️</span>
                    아기가 일어났어요 (수면 종료 및 저장)
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    지금 잠들었어요 (수면 측정 시작)
                  </>
                )}
              </button>
            </div>

            {/* Manual Sleep Time Input */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <span className="text-xs text-slate-500 shrink-0">직접 입력:</span>
              <input
                type="number"
                step="10"
                value={sleepDuration}
                onChange={(e) => setSleepDuration(Number(e.target.value))}
                className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs text-slate-800"
              />
              <span className="text-xs text-slate-600">분</span>
              <button
                onClick={handleManualSleep}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg active:scale-95 transition-all"
              >
                기록 추가
              </button>
            </div>
          </div>
        )}

        {/* 기저귀 */}
        {selectedType === "diaper" && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              1초 기저귀 교체 기록 (원터치)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSaveDiaper("pee")}
                className="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <span className="text-2xl">💧</span>
                <span className="font-extrabold text-xs text-sky-900">소변</span>
                <span className="text-[10px] text-sky-600">쉬했어요</span>
              </button>

              <button
                onClick={() => handleSaveDiaper("poop")}
                className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <span className="text-2xl">💩</span>
                <span className="font-extrabold text-xs text-amber-900">대변</span>
                <span className="text-[10px] text-amber-600">응가했어요</span>
              </button>

              <button
                onClick={() => handleSaveDiaper("both")}
                className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <span className="text-2xl">🌟</span>
                <span className="font-extrabold text-xs text-purple-900">소변+대변</span>
                <span className="text-[10px] text-purple-600">둘 다 했어요</span>
              </button>
            </div>
          </div>
        )}

        {/* 이유식 */}
        {selectedType === "food" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">이유식 섭취량 (g)</span>
              <span className="text-xl font-black text-orange-600">{foodAmount} g</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFoodAmount((prev) => Math.max(10, prev - 10))}
                className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
              >
                -10
              </button>
              <input
                type="number"
                step="5"
                value={foodAmount}
                onChange={(e) => setFoodAmount(Number(e.target.value))}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-black text-lg text-slate-800"
              />
              <button
                onClick={() => setFoodAmount((prev) => prev + 10)}
                className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
              >
                +10
              </button>
            </div>

            <button
              onClick={handleSaveFood}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              {foodAmount}g 이유식 기록 추가
            </button>
          </div>
        )}

        {/* 체온 */}
        {selectedType === "temp" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">체온 측정 & 투약 메모</span>
              <span
                className={`text-xl font-black ${
                  Number(tempValue) >= 38.0
                    ? "text-rose-600"
                    : Number(tempValue) >= 37.5
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {tempValue} ℃
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="35"
                max="42"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-28 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-black text-base text-slate-800"
              />
              <input
                type="text"
                placeholder="예: 챔프 빨강 3ml 복용"
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            <button
              onClick={handleSaveTemp}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              체온 기록 추가
            </button>
          </div>
        )}
      </div>

      {/* 4. Timeline Feed */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            오늘의 타임라인 ({dayLogs.length}건)
          </h4>
          <span className="text-[11px] text-slate-400">최신순</span>
        </div>

        {dayLogs.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <span className="text-3xl">🍼</span>
            <p className="text-xs text-slate-500 font-medium">
              아직 오늘의 기록이 없습니다. 상단에서 1초 만에 기록해보세요!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dayLogs.map((item) => {
              const typeConfig = LOG_TYPES[item.type.toUpperCase()] || {
                emoji: "📝",
                label: "기록"
              };
              const timeStr = new Date(item.timestamp).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-1 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-lg">
                      {typeConfig.emoji}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">
                        {item.note || typeConfig.label}
                      </div>
                      <div className="text-[10px] text-slate-400">{timeStr}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(item.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Ask AI about Today's Daily Pattern */}
      {onAskAI && dayLogs.length > 0 && (
        <button
          onClick={() =>
            onAskAI(
              `오늘 우리 아기 수유량(${summary.totalBottleMl}ml), 수면(${summary.sleepHoursText}), 기저귀(${summary.diaperTotal}회) 기록을 바탕으로 오늘 아기 컨디션과 수유 텀이 적절한지 분석해주세요.`
            )
          }
          className="w-full p-3.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-md active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>오늘의 수유·수면 패턴 AI 닥터 베베 분석 받기</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
