"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, X, Smartphone, Download, Sparkles } from "lucide-react";

export default function KakaoInAppHandler({ onOpenPwa }) {
  const [isKakao, setIsKakao] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();
    const isKakaoTalk = ua.includes("kakaotalk");
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsKakao(isKakaoTalk);
    setIsStandalone(isStandaloneMode);

    // 안드로이드 카카오톡인 경우 외부 브라우저(크롬)로 자동 전환 시도
    if (isKakaoTalk && /android/.test(ua)) {
      try {
        const targetUrl = window.location.href;
        window.location.href = `intent://${targetUrl.replace(
          /^https?:\/\//i,
          ""
        )}#Intent;scheme=https;package=com.android.chrome;end`;
      } catch (e) {}
    }
  }, []);

  if (isStandalone || isDismissed) return null;

  // 1. 카카오톡 인앱 브라우저 경고 & 사파리 전환 가이드 배너
  if (isKakao) {
    return (
      <div className="bg-linear-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sticky top-0 z-50 animate-in slide-in-from-top">
        <div className="flex items-center gap-2">
          <span className="text-base animate-bounce">👉</span>
          <div>
            <div className="font-extrabold flex items-center gap-1">
              <span>사파리(Safari) / 크롬으로 열기</span>
            </div>
            <p className="text-[11px] text-amber-100">
              우측 하단 <strong>[점 3개(…)]</strong> &gt; <strong>[다른 브라우저로 열기]</strong>를 누르면 1초 만에 앱으로 설치됩니다!
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/20 text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 2. 일반 모바일 브라우저 스마트 앱 설치 유도 배너
  return (
    <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-sm">🍼</span>
        <div>
          <span className="font-bold text-amber-400">데이트베이비 앱으로 쓰기</span>
          <span className="text-[10px] text-slate-300 ml-1.5 hidden sm:inline">
            홈 화면에 추가하면 풀스크린으로 실행됩니다
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPwa}
          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-lg shadow-xs flex items-center gap-1 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          앱 설치하기
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
