"use client";

import React, { useState, useEffect } from "react";
import { X, Baby, Heart, Calendar, Sparkles, Check, Save } from "lucide-react";
import { formatISODate } from "@/lib/dateUtils";

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) {
  const [isPregnant, setIsPregnant] = useState(profile?.isPregnant ?? false);
  const [name, setName] = useState(profile?.name || "단이");
  const [gender, setGender] = useState(profile?.gender || "unknown"); // 'boy' | 'girl' | 'unknown'
  const [date, setDate] = useState(
    profile?.isPregnant
      ? profile?.dueDate || formatISODate(new Date(Date.now() + 90 * 86400000))
      : profile?.birthDate || formatISODate(new Date(Date.now() - 90 * 86400000))
  );
  const [weight, setWeight] = useState(profile?.weight ? String(profile.weight) : "7.2");
  const [familyCode, setFamilyCode] = useState(profile?.familyCode || "");

  useEffect(() => {
    if (profile) {
      setIsPregnant(profile.isPregnant ?? false);
      setName(profile.name || "단이");
      setGender(profile.gender || "unknown");
      setDate(
        profile.isPregnant
          ? profile.dueDate || formatISODate(new Date())
          : profile.birthDate || formatISODate(new Date())
      );
      setWeight(profile.weight ? String(profile.weight) : "7.2");
      setFamilyCode(profile.familyCode || "");
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProfile = {
      isPregnant,
      name: name.trim() || "우리 아기",
      gender,
      dueDate: isPregnant ? date : profile?.dueDate || date,
      birthDate: !isPregnant ? date : profile?.birthDate || date,
      weight: parseFloat(weight) || 7.0,
      familyCode: familyCode.trim().toLowerCase()
    };
    onSaveProfile(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 bg-linear-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">아기 정보 설정</h3>
              <p className="text-[11px] text-amber-100">
                출산 전·후 상태 및 D-Day 기준일 변경
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-slate-50">
          {/* Mode Switch (임신 중 vs 출산 후) */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => setIsPregnant(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isPregnant
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🤰</span>
              임신 중 (출산 전)
            </button>
            <button
              type="button"
              onClick={() => setIsPregnant(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isPregnant
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>👶</span>
              출산 후 (생후 일수)
            </button>
          </div>

          {/* Baby Name Input */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isPregnant ? "아기 태명" : "아기 이름 / 태명"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 단이, 콩콩이"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Date Input */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {isPregnant ? "출산 예정일" : "아기 생년월일"}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              {isPregnant
                ? "* 입력한 출산 예정일 기준으로 임신 주수와 D-Day가 계산됩니다."
                : "* 입력한 생년월일 기준으로 생후 일수와 원더윅스가 자동 산출됩니다."}
            </p>
          </div>

          {/* Weight Input (출산 후) */}
          {!isPregnant && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                현재 몸무게 (kg)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="30"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  placeholder="예: 7.5"
                />
                <span className="font-bold text-sm text-slate-600">kg</span>
              </div>
            </div>
          )}

          {/* Family Code (Firebase Realtime Cloud Sync) */}
          <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <span>🔥</span>
                부부 실시간 동기화 가족 코드 (Firebase)
              </label>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              부부가 동일한 가족 코드를 입력해두면, 한쪽에서 수정한 몸무게와 마일스톤이 상대방 폰에 실시간으로 자동 동기화됩니다.
            </p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                placeholder="예: dani2026"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-purple-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => {
                  const randomCode = "baby-" + Math.random().toString(36).substring(2, 6);
                  setFamilyCode(randomCode);
                }}
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs rounded-xl active:scale-95 transition-all"
              >
                🎲 랜덤 코드
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all mt-2"
          >
            <Save className="w-4 h-4" />
            저장하고 적용하기
          </button>

          {/* Share with Spouse (URL Copy with Family Code) */}
          <button
            type="button"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("name", name.trim() || "우리 아기");
              url.searchParams.set("mode", isPregnant ? "pregnant" : "born");
              url.searchParams.set("date", date);
              url.searchParams.set("weight", weight);
              if (familyCode) url.searchParams.set("family", familyCode.trim());
              navigator.clipboard.writeText(url.toString());
              alert("💌 와이프/남편 공유 링크가 복사되었습니다!\n\n카카오톡으로 이 링크를 보내면 상대방 폰에서도 클릭 한 번으로 똑같이 자동 세팅 및 실시간 연동됩니다.");
            }}
            className="w-full py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-300 shadow-2xs active:scale-95 transition-all"
          >
            <span>🔗</span>
            와이프/가족에게 프로필 공유 링크 복사
          </button>
        </form>
      </div>
    </div>
  );
}
