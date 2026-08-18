"use client";

import React from "react";
import {
  Baby,
  Sparkles,
  HeartPulse,
  Settings,
  Download,
  Music,
  Cloud,
  User,
  LogIn
} from "lucide-react";

export default function Header({
  profile,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenEmergency,
  onOpenPwa,
  onOpenWhiteNoise,
  onOpenChat
}) {
  // 사용자 호칭 뱃지 텍스트 계산
  const getBadgeLabel = () => {
    if (!currentUser) return "";
    const name = currentUser.displayName || "";
    const isGeneric =
      !name ||
      name === "카카오 회원" ||
      name === "네이버 회원" ||
      name === "카카오" ||
      name === "네이버" ||
      name === "소셜 회원" ||
      name === "게스트 회원";

    const role = currentUser.role || (typeof window !== "undefined" ? localStorage.getItem("datebaby_user_role") : null) || "mom";
    const roleEmoji = role === "dad" ? "👨" : "👩";
    const roleText = role === "dad" ? "아빠" : "엄마";

    if (isGeneric) {
      return `${roleEmoji} ${roleText}`;
    }
    return `${roleEmoji} ${name}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-xs px-3 sm:px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo & Baby Name */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 text-left group transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-200 to-rose-200 flex items-center justify-center shadow-inner border border-amber-300/40 group-hover:scale-105 transition-transform">
            <span className="text-xl">🍼</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-slate-800 text-base leading-tight">
                {profile?.name || "우리 아기"}
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {profile?.isPregnant ? "임신 중 🤰" : "성장 중 👶"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
              <span>데이트베이비</span>
              {profile?.familyCode && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    클라우드 연동
                  </span>
                </>
              )}
            </div>
          </div>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Dedicated Login / User Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black border border-amber-300/80 transition-all active:scale-95 shadow-2xs"
              title="내 계정 정보 및 아기 설정"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="avatar"
                  className="w-4 h-4 rounded-full border border-amber-300"
                />
              ) : null}
              <span className="max-w-[70px] truncate">
                {getBadgeLabel()}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-xs transition-all active:scale-95"
              title="로그인 / 회원가입"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}

          {/* White Noise Player Button */}
          <button
            onClick={onOpenWhiteNoise}
            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all active:scale-95 shadow-2xs"
            title="수면 유도 백색소음기 & 오르골"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1 px-2 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all active:scale-95 shadow-xs"
            title="소아 응급 SOS & 해열제 계산기"
          >
            <HeartPulse className="w-4 h-4 text-rose-600 animate-pulse" />
          </button>

          {/* Settings / Profile Button */}
          <button
            onClick={onOpenProfile}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all active:scale-95"
            title="아기 정보 및 부부 연동 설정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
