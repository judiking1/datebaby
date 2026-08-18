"use client";

import React from "react";
import { Baby, Sparkles, HeartPulse, Settings, Download, Music, Cloud } from "lucide-react";

export default function Header({
  profile,
  onOpenProfile,
  onOpenEmergency,
  onOpenPwa,
  onOpenWhiteNoise,
  onOpenChat
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-xs px-4 py-3">
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
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all active:scale-95 shadow-xs"
            title="소아 응급 SOS & 해열제 계산기"
          >
            <HeartPulse className="w-4 h-4 text-rose-600 animate-pulse" />
            <span className="hidden sm:inline">응급 SOS</span>
          </button>

          {/* PWA Install Button */}
          <button
            onClick={onOpenPwa}
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all active:scale-95 shadow-2xs"
            title="홈 화면에 앱 설치하기"
          >
            <Download className="w-4 h-4" />
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
