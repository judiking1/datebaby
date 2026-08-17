"use client";

import React, { useState } from "react";
import {
  Baby,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Bot,
  CheckCircle2,
  HelpCircle,
  Share2,
  Heart
} from "lucide-react";

export default function DailyGuideSection({
  guide,
  status,
  profile,
  onAskAI
}) {
  const [liked, setLiked] = useState(false);

  return (
    <section className="px-4 py-3 max-w-md mx-auto space-y-4">
      {/* 1. Hero Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
            {guide.ageTitle || guide.dDayBadge}
          </span>
          <button
            onClick={() => setLiked(!liked)}
            className={`p-2 rounded-full border transition-all active:scale-90 ${
              liked
                ? "bg-rose-50 border-rose-200 text-rose-500"
                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-400"
            }`}
            title="오늘 가이드 좋아요"
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-rose-500" : ""}`} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-800 leading-snug mt-1">
          {guide.heroTitle}
        </h3>

        {guide.sizeComparison && (
          <p className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/60 inline-block">
            🌱 현재 아기 크기: {guide.sizeComparison}
          </p>
        )}

        {/* Warm Quote */}
        {guide.quote && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600 italic bg-amber-50/40 p-3 rounded-2xl">
            <span className="text-base leading-none">💌</span>
            <p className="leading-relaxed font-medium">"{guide.quote}"</p>
          </div>
        )}
      </div>

      {/* 2. Pillar 1: Baby State & Behavior Forecast */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all">
        <div className="flex items-center gap-2.5 mb-3 text-slate-800">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Baby className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">
              오늘 아기 상태 & 행동 예측
            </h4>
            <p className="text-[11px] text-slate-500">
              왜 이런 행동을 하고 무엇을 느낄까요?
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-blue-50/30 p-3.5 rounded-2xl border border-blue-100/60 font-normal">
          {guide.babyBehavior}
        </p>
      </div>

      {/* 3. Pillar 2: Parents' Action Guide (Do's & Don'ts) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all">
        <div className="flex items-center gap-2.5 mb-3 text-slate-800">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">
              엄마·아빠 필수 행동 요령
            </h4>
            <p className="text-[11px] text-slate-500">
              오늘 부모가 꼭 해줘야 할 실천 가이드
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-amber-50/30 p-3.5 rounded-2xl border border-amber-100/60">
          {guide.parentAction}
        </div>
      </div>

      {/* 4. Pillar 3: Safety & Health Checklist */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all">
        <div className="flex items-center gap-2.5 mb-3 text-slate-800">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">
              건강 & 안전 주의사항
            </h4>
            <p className="text-[11px] text-slate-500">
              놓치기 쉬운 필수 체크포인트
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-rose-50/30 p-3.5 rounded-2xl border border-rose-100/60">
          {guide.safetyHealth}
        </div>
      </div>

      {/* 5. Pillar 4: Recommended Sensory Play */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all">
        <div className="flex items-center gap-2.5 mb-3 text-slate-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">
              오늘의 추천 오감 놀이 & 자극
            </h4>
            <p className="text-[11px] text-slate-500">
              뇌 발달과 정서 애착을 돕는 초간단 놀이
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-emerald-50/30 p-3.5 rounded-2xl border border-emerald-100/60">
          {guide.sensoryPlay}
        </div>
      </div>

      {/* 6. AI Question Trigger Banner */}
      <div className="rounded-3xl bg-linear-to-r from-violet-500 to-indigo-600 p-4 text-white shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h5 className="font-bold text-sm leading-tight">
              오늘 아기 행동이 이상한가요?
            </h5>
            <p className="text-xs text-violet-100 mt-0.5">
              월령 맞춤 AI 소아과 코치에게 바로 질문하세요
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            onAskAI(
              `${profile.name}(${status.displayAge})가 오늘 평소와 다르게 보채거나 특이 행동을 해요. 어떻게 대처해야 할까요?`
            )
          }
          className="shrink-0 px-3.5 py-2 rounded-xl bg-white text-violet-700 font-bold text-xs hover:bg-violet-50 active:scale-95 transition-all shadow-xs"
        >
          AI 상담하기
        </button>
      </div>
    </section>
  );
}
