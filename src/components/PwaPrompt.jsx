"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  CheckCircle2,
  Sparkles,
  Laptop,
  Check
} from "lucide-react";

export default function PwaPrompt({ isOpen, onClose }) {
  const [deviceTab, setDeviceTab] = useState("ios"); // 'ios' | 'android' | 'desktop'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 자동 기기 감지
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setDeviceTab("ios");
      } else if (/android/.test(ua)) {
        setDeviceTab("android");
      } else {
        setDeviceTab("desktop");
      }

      // PWA beforeinstallprompt 이벤트 캡처
      const handleBeforeInstall = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      window.addEventListener("appinstalled", () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (!deferredPrompt) {
      alert("브라우저 메뉴(우측 상단 점 3개 또는 공유 버튼)에서 [홈 화면에 추가] 또는 [앱 설치]를 선택해주세요.");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (e) {
      console.warn("PWA Prompt Error:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">스마트폰 홈 화면에 앱 설치</h3>
              <p className="text-[11px] text-blue-100">
                아이폰 & 갤럭시에서 일반 네이티브 앱처럼 바로 켜기
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

        {/* Tab Switcher */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex gap-1.5">
          <button
            onClick={() => setDeviceTab("ios")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              deviceTab === "ios"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <span>🍎</span>
            아이폰 (iOS Safari)
          </button>
          <button
            onClick={() => setDeviceTab("android")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              deviceTab === "android"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <span>🤖</span>
            갤럭시 / 안드로이드
          </button>
          <button
            onClick={() => setDeviceTab("desktop")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              deviceTab === "desktop"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            PC
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 bg-white text-slate-800">
          {/* Native Install Button (브라우저 지원 시 즉시 노출) */}
          {deferredPrompt && (
            <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">
                  원클릭 앱 다운로드가 지원되는 브라우저입니다
                </span>
              </div>
              <button
                onClick={handleNativeInstall}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                🚀 지금 1초 만에 앱 설치하기
              </button>
            </div>
          )}

          {deviceTab === "ios" ? (
            <div className="space-y-3.5">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Share className="w-4 h-4 text-blue-600" />
                아이폰 Safari에서 10초 만에 홈 화면 추가하는 법
              </h4>

              <ol className="space-y-3 text-xs leading-relaxed">
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">
                      사파리(Safari) 브라우저 하단 중앙
                    </span>
                    의 <strong>[공유(네모 위 화살표 <Share className="inline w-3 h-3 text-blue-600" />)]</strong> 버튼을 누릅니다.
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    스크롤을 내려 <strong>[홈 화면에 추가 <PlusSquare className="inline w-3 h-3 text-blue-600" />]</strong> 메뉴를 선택합니다.
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    우측 상단의 <strong>[추가]</strong>를 누르면 바탕화면에 🍼 <strong>데이트베이비</strong> 앱 아이콘이 완성됩니다!
                  </div>
                </li>
              </ol>
            </div>
          ) : deviceTab === "android" ? (
            <div className="space-y-3.5">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <MoreVertical className="w-4 h-4 text-blue-600" />
                갤럭시 (Chrome / 삼성인터넷) 추가하는 법
              </h4>

              <ol className="space-y-3 text-xs leading-relaxed">
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    크롬 브라우저 우측 상단 <strong>[점 3개(메뉴)]</strong> 또는 삼성인터넷 우측 하단 <strong>[더보기(줄 3개)]</strong>를 누릅니다.
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    메뉴 중 <strong>[앱 설치]</strong> 또는 <strong>[현재 페이지 추가 &gt; 홈 화면]</strong>을 탭합니다.
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    팝업에서 <strong>[설치]</strong>를 누르면 주소창 없는 깔끔한 전체 화면 앱으로 실행됩니다!
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3.5">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-600" />
                PC / Mac 데스크톱 브라우저 설치
              </h4>

              <ol className="space-y-3 text-xs leading-relaxed">
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    Chrome 또는 Edge 브라우저 상단 <strong>주소창 우측 끝의 [설치 아이콘(컴퓨터 모양)]</strong>을 클릭합니다.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    독립 창 앱으로 실행되어 언제든 빠르게 육아 일기와 AI 코치를 열 수 있습니다.
                  </div>
                </li>
              </ol>
            </div>
          )}

          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-[11px] text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              홈 화면에 추가하시면 오프라인 캐싱 및 부부 실시간 클라우드 동기화가 완벽하게 유지됩니다.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}
