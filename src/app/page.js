"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import BabyDateHero from "@/components/BabyDateHero";
import DailyGuideSection from "@/components/DailyGuideSection";
import WonderWeeksSection from "@/components/WonderWeeksSection";
import MilestoneTracker from "@/components/MilestoneTracker";
import AICoachModal from "@/components/AICoachModal";
import EmergencyModal from "@/components/EmergencyModal";
import ProfileModal from "@/components/ProfileModal";
import PwaPrompt from "@/components/PwaPrompt";
import { calculateBabyStatus, formatISODate } from "@/lib/dateUtils";
import { getDailyGuide } from "@/data/guideData";
import { syncFamilyToCloud, listenToFamilyCloud } from "@/lib/firebase";
import { BookOpen, Zap, Award, Bot, HeartPulse, CloudCheck } from "lucide-react";

// 기본 아기 프로필 (첫 방문 시 기본값)
const DEFAULT_PROFILE = {
  isPregnant: false,
  name: "단이",
  gender: "girl",
  birthDate: "2026-05-20", // 생후 약 90일(3개월) 전후 기준
  dueDate: "2026-05-20",
  weight: 6.8,
  familyCode: "dani2026"
};

export default function Home() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("guide"); // 'guide' | 'wonder' | 'milestones'
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isPwaOpen, setIsPwaOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");

  // Load from LocalStorage or URL params (for spouse sync)
  useEffect(() => {
    // 1. URL 파라미터가 있는 경우 우선 반영 (와이프 공유 링크)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlName = params.get("name");
      const urlMode = params.get("mode");
      const urlDate = params.get("date");
      const urlWeight = params.get("weight");
      const urlFamily = params.get("family");

      if (urlName && urlDate) {
        const isPreg = urlMode === "pregnant";
        const syncedProfile = {
          name: urlName,
          isPregnant: isPreg,
          gender: "unknown",
          birthDate: !isPreg ? urlDate : urlDate,
          dueDate: isPreg ? urlDate : urlDate,
          weight: parseFloat(urlWeight) || 7.0,
          familyCode: urlFamily || "dani2026"
        };
        setProfile(syncedProfile);
        localStorage.setItem("datebaby_profile", JSON.stringify(syncedProfile));
        setIsLoaded(true);
        return;
      }
    } catch (e) {}

    // 2. 일반 로컬스토리지 로드
    const saved = localStorage.getItem("datebaby_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  // 3. Firebase 실시간 클라우드 리스너 (부부 간 실시간 동기화)
  useEffect(() => {
    if (!profile?.familyCode) return;

    const unsubscribe = listenToFamilyCloud(profile.familyCode, (cloudData) => {
      if (cloudData?.profile) {
        setProfile((prev) => ({
          ...prev,
          ...cloudData.profile
        }));
        localStorage.setItem(
          "datebaby_profile",
          JSON.stringify({ ...profile, ...cloudData.profile })
        );
      }
    });

    return () => unsubscribe();
  }, [profile?.familyCode]);

  const handleSaveProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem("datebaby_profile", JSON.stringify(newProfile));
    // Firebase Cloud 동기화 전송
    if (newProfile.familyCode) {
      syncFamilyToCloud(newProfile.familyCode, { profile: newProfile });
    }
  };

  const handleAskAI = (question) => {
    setChatQuestion(question);
    setIsChatOpen(true);
  };

  // Status & Guide calculation
  const status = calculateBabyStatus(profile, currentDate);
  const dailyGuide = getDailyGuide(status);

  const todayStr = formatISODate(new Date());
  const currentStr = formatISODate(currentDate);
  const isToday = todayStr === currentStr;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans pb-24 selection:bg-amber-200">
      {/* 1. Header */}
      <Header
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenPwa={() => setIsPwaOpen(true)}
        onOpenChat={() => {
          setChatQuestion("");
          setIsChatOpen(true);
        }}
      />

      {/* 2. Baby Status Hero & Date Switcher */}
      <BabyDateHero
        profile={profile}
        status={status}
        currentDate={currentDate}
        onDateChange={(d) => setCurrentDate(d)}
        onResetToday={() => setCurrentDate(new Date())}
        isToday={isToday}
      />

      {/* 3. Main Navigation Tab Bar */}
      <div className="max-w-md mx-auto w-full px-4 pt-3">
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex gap-1">
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "guide"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            오늘의 가이드
          </button>

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("wonder")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "wonder"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              원더윅스
            </button>
          )}

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("milestones")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "milestones"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              마일스톤
            </button>
          )}
        </div>
      </div>

      {/* 4. Main Tab Content */}
      <main className="flex-1">
        {activeTab === "guide" && (
          <DailyGuideSection
            guide={dailyGuide}
            status={status}
            profile={profile}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === "wonder" && !profile.isPregnant && (
          <WonderWeeksSection status={status} profile={profile} />
        )}

        {activeTab === "milestones" && !profile.isPregnant && (
          <MilestoneTracker profile={profile} />
        )}
      </main>

      {/* 5. Floating AI Coach FAB (Bottom-Right) */}
      <div className="fixed bottom-20 right-4 sm:right-[max(1rem,calc(50%-220px))] z-40">
        <button
          onClick={() => {
            setChatQuestion("");
            setIsChatOpen(true);
          }}
          className="group flex items-center gap-2 px-4 py-3 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full shadow-xl shadow-indigo-500/30 active:scale-95 transition-all border border-white/30"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-600 animate-pulse" />
          </div>
          <span className="font-bold text-xs">닥터 베베 AI</span>
        </button>
      </div>

      {/* 6. Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-6">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "guide" ? "text-amber-600 font-bold scale-105" : "text-slate-400 font-medium"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">오늘 가이드</span>
          </button>

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("wonder")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === "wonder" ? "text-purple-600 font-bold scale-105" : "text-slate-400 font-medium"
              }`}
            >
              <Zap className="w-5 h-5" />
              <span className="text-[10px]">원더윅스</span>
            </button>
          )}

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("milestones")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === "milestones" ? "text-amber-600 font-bold scale-105" : "text-slate-400 font-medium"
              }`}
            >
              <Award className="w-5 h-5" />
              <span className="text-[10px]">마일스톤</span>
            </button>
          )}

          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="flex flex-col items-center gap-1 text-rose-500 font-semibold active:scale-95 transition-all"
          >
            <HeartPulse className="w-5 h-5" />
            <span className="text-[10px]">응급 SOS</span>
          </button>

          <button
            onClick={() => {
              setChatQuestion("");
              setIsChatOpen(true);
            }}
            className="flex flex-col items-center gap-1 text-violet-600 font-semibold active:scale-95 transition-all"
          >
            <Bot className="w-5 h-5" />
            <span className="text-[10px]">AI 코치</span>
          </button>
        </div>
      </nav>

      {/* 7. Modals */}
      <AICoachModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        profile={profile}
        status={status}
        initialQuestion={chatQuestion}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        profile={profile}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <PwaPrompt isOpen={isPwaOpen} onClose={() => setIsPwaOpen(false)} />
    </div>
  );
}
