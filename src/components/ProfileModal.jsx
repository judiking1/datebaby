"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Baby,
  Heart,
  Calendar,
  Sparkles,
  Check,
  Save,
  Share2,
  Copy,
  Cloud,
  CheckCircle2,
  LogIn,
  LogOut,
  User,
  ShieldCheck
} from "lucide-react";
import { formatISODate } from "@/lib/dateUtils";
import {
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  getFirebaseAuth
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) {
  const [isPregnant, setIsPregnant] = useState(profile?.isPregnant ?? false);
  const [name, setName] = useState(profile?.name || "우리 아기");
  const [gender, setGender] = useState(profile?.gender || "girl");
  const [date, setDate] = useState(
    profile?.isPregnant
      ? profile?.dueDate || formatISODate(new Date(Date.now() + 90 * 86400000))
      : profile?.birthDate || formatISODate(new Date(Date.now() - 90 * 86400000))
  );
  const [weight, setWeight] = useState(
    profile?.weight ? String(profile.weight) : "6.8"
  );
  const [familyCode, setFamilyCode] = useState(profile?.familyCode || "dani2026");
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsPregnant(profile.isPregnant ?? false);
      setName(profile.name || "우리 아기");
      setGender(profile.gender || "girl");
      setDate(
        profile.isPregnant
          ? profile.dueDate || formatISODate(new Date())
          : profile.birthDate || formatISODate(new Date())
      );
      setWeight(profile.weight ? String(profile.weight) : "6.8");
      setFamilyCode(profile.familyCode || "dani2026");
    }
  }, [profile, isOpen]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const user = await loginWithGoogle();
      setCurrentUser(user);
    } catch (e) {
      console.warn("Google Login Error:", e);
      alert("로그인 중 오류가 발생했습니다: " + (e.message || "다시 시도해주세요."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProfile = {
      isPregnant,
      name: name.trim() || "우리 아기",
      gender,
      dueDate: isPregnant ? date : profile?.dueDate || date,
      birthDate: !isPregnant ? date : profile?.birthDate || date,
      weight: parseFloat(weight) || 6.8,
      familyCode: familyCode.trim().toLowerCase()
    };
    onSaveProfile(newProfile);
    onClose();
  };

  const handleShareLink = async () => {
    const url = new URL(window.location.origin || window.location.href);
    url.searchParams.set("name", name.trim() || "우리 아기");
    url.searchParams.set("mode", isPregnant ? "pregnant" : "born");
    url.searchParams.set("date", date);
    url.searchParams.set("weight", weight);
    if (familyCode) url.searchParams.set("family", familyCode.trim());

    const shareUrl = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `[데이트베이비] ${name}의 육아 일기 초대장`,
          text: `[데이트베이비] 우리 아기 ${name}의 성장 가이드와 수유/수면 기록에 초대합니다! 링크를 누르면 별도 가입 없이 실시간 부부 연동이 완료됩니다.`,
          url: shareUrl
        });
        return;
      } catch (e) {}
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    alert(
      `💌 [${name}] 가족 초대 링크가 복사되었습니다!\n\n카카오톡으로 배우자에게 보내면 링크 클릭 한 번으로 상대방 폰에서도 아기 데이터가 실시간 자동 연동됩니다.`
    );
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
              <h3 className="font-bold text-sm">아기 정보 및 부부 연동 설정</h3>
              <p className="text-[11px] text-amber-100">
                출산 전·후 상태 및 실시간 클라우드 공유
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
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 bg-slate-50 max-h-[75vh] overflow-y-auto"
        >
          {/* 1. Google 1초 간편 로그인 카드 */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {currentUser
                    ? currentUser.displayName || currentUser.email || "로그인됨"
                    : "로그인 시 기기 변경에도 영구 보존"}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firebase 클라우드 실시간 연동 활성
                </div>
              </div>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-bold"
              >
                로그아웃
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Google 1초 로그인
              </button>
            )}
          </div>

          {/* 2. Mode Switch (임신 중 vs 출산 후) */}
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

          {/* 3. Baby Name Input */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {isPregnant ? "아기 태명" : "아기 이름 / 태명"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 단이, 콩콩이, 튼튼이"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* 4. Gender Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              아기 성별 (성장 도표 및 맞춤 팁용)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender("girl")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  gender === "girl"
                    ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                👧 공주님 (여아)
              </button>
              <button
                type="button"
                onClick={() => setGender("boy")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  gender === "boy"
                    ? "bg-blue-500 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                👦 왕자님 (남아)
              </button>
            </div>
          </div>

          {/* 5. Date Input */}
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
          </div>

          {/* 6. Weight Input (출산 후) */}
          {!isPregnant && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                현재 몸무게 (kg) - 해열제 용량 & 성장 백분위 산출 기준
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
                  placeholder="예: 6.8"
                />
                <span className="font-bold text-sm text-slate-600">kg</span>
              </div>
            </div>
          )}

          {/* 7. Family Code & Realtime Cloud Sync */}
          <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-purple-600" />
                부부 실시간 연동 가족 코드
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                🟢 클라우드 동기화 중
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              부부가 동일한 코드를 가지고 있으면, 한쪽에서 기록한 수유/수면/성장/접종 데이터가 상대방 폰에 1초 만에 자동 반영됩니다.
            </p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                placeholder="예: baby-love-2026"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-purple-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => {
                  const randomCode = "baby-" + Math.random().toString(36).substring(2, 7);
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

          {/* 1-Click Spouse Invite Button */}
          <button
            type="button"
            onClick={handleShareLink}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            {copied
              ? "✅ 카카오톡 공유 링크 복사 완료!"
              : "💌 카카오톡으로 배우자/가족 1초 초대하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
