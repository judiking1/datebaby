"use client";

import React, { useState } from "react";
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function PwaPrompt({ isOpen, onClose }) {
  const [deviceTab, setDeviceTab] = useState("ios"); // 'ios' | 'android'

  if (!isOpen) return null;

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
                아이폰 & 갤럭시에서 일반 앱처럼 바로 켜기
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
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2">
          <button
            onClick={() => setDeviceTab("ios")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              deviceTab === "ios"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <span>🍎</span>
            와이프용 (아이폰 Safari)
          </button>
          <button
            onClick={() => setDeviceTab("android")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              deviceTab === "android"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            <span>🤖</span>
            남편용 (갤럭시 Chrome)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 bg-white text-slate-800">
          {deviceTab === "ios" ? (
            <div className="space-y-3.5">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Share className="w-4 h-4 text-blue-600" />
                아이폰(Safari)에서 10초 만에 추가하는 법
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
                    의 <strong>[공유(네모 위 화살표)]</strong> 아이콘을 탭합니다.
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    아래로 스크롤하여 <strong>[홈 화면에 추가]</strong> 버튼을 탭합니다.
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    우측 상단의 <strong>[추가]</strong>를 누르면 바탕화면에 🍼 <strong>데이트베이비</strong> 앱 아이콘이 생성됩니다!
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3.5">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <MoreVertical className="w-4 h-4 text-blue-600" />
                갤럭시(Chrome / 삼성인터넷)에서 추가하는 법
              </h4>

              <ol className="space-y-3 text-xs leading-relaxed">
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    크롬 브라우저 우측 상단의 <strong>[점 3개(메뉴)]</strong> 아이콘을 누릅니다.
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    메뉴 중 <strong>[앱 설치]</strong> 또는 <strong>[홈 화면에 추가]</strong>를 탭합니다.
                  </div>
                </li>

                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    설치 확인 팝업에서 <strong>[설치]</strong>를 누르면 일반 앱과 똑같이 전체 화면으로 실행됩니다!
                  </div>
                </li>
              </ol>
            </div>
          )}

          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-[11px] text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              홈 화면에 추가하시면 주소창 없이 **풀스크린 네이티브 앱**처럼 작동합니다!
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
