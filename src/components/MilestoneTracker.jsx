"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Award, Sparkles, Heart } from "lucide-react";
import confetti from "canvas-confetti";

export const MILESTONES = [
  { id: "birth", period: "생후 1일", title: "축 탄생! 세상에 온 날", icon: "🍼" },
  { id: "smile", period: "생후 1개월", title: "첫 사회적 미소 & 옹알이", icon: "✨" },
  { id: "head", period: "생후 3개월", title: "완벽한 목 가누기 & 100일", icon: "👑" },
  { id: "roll", period: "생후 4~5개월", title: "첫 뒤집기 영차영차 성공!", icon: "🤸" },
  { id: "food", period: "생후 5~6개월", title: "첫 이유식 쌀미음 냠냠", icon: "🥣" },
  { id: "tooth", period: "생후 6개월", title: "첫니(아래 앞니) 뿅!", icon: "🦷" },
  { id: "sit", period: "생후 7개월", title: "손 짚고 스스로 앉기", icon: "🧘" },
  { id: "crawl", period: "생후 8개월", title: "네발기기로 온 집안 탐험", icon: "🐾" },
  { id: "stand", period: "생후 9~10개월", title: "가구 잡고 번쩍 일어서기", icon: "🏃" },
  { id: "first_walk", period: "생후 12개월", title: "첫 돌 & 첫 걸음마 성공!", icon: "🎉" },
  { id: "first_word", period: "생후 12개월", title: "첫 단어 ('엄마', '아빠')", icon: "🗣️" },
  { id: "spoon", period: "생후 15~18개월", title: "숟가락으로 스스로 먹기", icon: "🥄" },
  { id: "sentence", period: "생후 24개월", title: "두 단어 문장 말하기 ('물 줘')", icon: "💬" },
  { id: "potty", period: "생후 30~36개월", title: "배변 훈련 멋지게 완성!", icon: "🚽" }
];

export default function MilestoneTracker({ profile }) {
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("datebaby_milestones");
    if (saved) {
      try {
        setCompleted(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleMilestone = (id) => {
    const updated = { ...completed, [id]: !completed[id] };
    setCompleted(updated);
    localStorage.setItem("datebaby_milestones", JSON.stringify(updated));

    if (!completed[id]) {
      // Confetti burst when checked!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / MILESTONES.length) * 100);

  return (
    <section className="px-4 py-3 max-w-md mx-auto space-y-4">
      <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                {profile?.name} 성장 마일스톤
              </h3>
              <p className="text-[11px] text-slate-500">
                0~36개월 주요 발달 달성 체크리스트
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
            {completedCount} / {MILESTONES.length} 완료 ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-linear-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone List */}
        <div className="space-y-2 mt-2">
          {MILESTONES.map((item) => {
            const isDone = !!completed[item.id];
            return (
              <button
                key={item.id}
                onClick={() => toggleMilestone(item.id)}
                className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left active:scale-98 ${
                  isDone
                    ? "bg-amber-50/60 border-amber-200 text-amber-950"
                    : "bg-white border-slate-200/80 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isDone ? "text-amber-950 line-through opacity-80" : "text-slate-800"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-500">{item.period}</p>
                  </div>
                </div>

                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
