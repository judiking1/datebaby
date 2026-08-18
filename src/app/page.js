"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import BabyDateHero from "@/components/BabyDateHero";
import DailyGuideSection from "@/components/DailyGuideSection";
import DailyLogSection from "@/components/DailyLogSection";
import GrowthCurveSection from "@/components/GrowthCurveSection";
import VaccineSection from "@/components/VaccineSection";
import WonderWeeksSection from "@/components/WonderWeeksSection";
import MilestoneTracker from "@/components/MilestoneTracker";
import AICoachModal from "@/components/AICoachModal";
import EmergencyModal from "@/components/EmergencyModal";
import ProfileModal from "@/components/ProfileModal";
import AuthModal from "@/components/AuthModal";
import PwaPrompt from "@/components/PwaPrompt";
import WhiteNoisePlayer from "@/components/WhiteNoisePlayer";
import KakaoInAppHandler from "@/components/KakaoInAppHandler";
import { calculateBabyStatus, formatISODate } from "@/lib/dateUtils";
import { getDailyGuide } from "@/data/guideData";
import {
  syncFamilyToCloud,
  listenToFamilyCloud,
  getFirebaseAuth,
  getUserProfile
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  BookOpen,
  Zap,
  Award,
  Bot,
  HeartPulse,
  Milk,
  TrendingUp,
  ShieldCheck,
  Music,
  CheckCircle2
} from "lucide-react";

const DEFAULT_PROFILE = {
  isPregnant: false,
  name: "우리 아기",
  gender: "girl",
  birthDate: "2026-05-20",
  dueDate: "2026-05-20",
  weight: 6.8,
  familyCode: "dani2026"
};

export default function Home() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("guide");
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncToast, setSyncToast] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isPwaOpen, setIsPwaOpen] = useState(false);
  const [isWhiteNoiseOpen, setIsWhiteNoiseOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");

  // 1. Handle OAuth Popup Callback (Naver & Kakao)
  useEffect(() => {
    setIsLoaded(true);

    if (typeof window !== "undefined") {
      // 팝업 창 안에서 콜백이 실행된 경우 부모 창에 메시지 전달 후 닫기
      if (window.opener) {
        try {
          const hash = window.location.hash;
          const search = window.location.search;

          // 네이버 액세스 토큰 감지
          if (hash.includes("access_token=")) {
            const params = new URLSearchParams(hash.replace("#", "?"));
            const token = params.get("access_token");
            if (token) {
              window.opener.postMessage(
                { type: "NAVER_TOKEN", accessToken: token },
                window.location.origin
              );
              window.close();
              return;
            }
          }

          // 카카오 인가 코드 감지
          if (search.includes("code=")) {
            const params = new URLSearchParams(search);
            const code = params.get("code");
            if (code) {
              window.opener.postMessage(
                { type: "KAKAO_CODE", code: code },
                window.location.origin
              );
              window.close();
              return;
            }
          }

          window.close();
        } catch (e) {}
      }
    }
  }, []);

  // 2. Firebase Auth state listener & LocalStorage user restoration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("datebaby_user");
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {}
      }
    }

    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const u = {
          uid: user.uid,
          displayName: user.displayName || "보호자",
          email: user.email,
          photoURL: user.photoURL
        };
        setCurrentUser(u);
        localStorage.setItem("datebaby_user", JSON.stringify(u));
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Load from LocalStorage or URL params (1-click invite link)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);
      const urlFamily = params.get("family");
      const urlName = params.get("name");
      const urlMode = params.get("mode");
      const urlDate = params.get("date");
      const urlWeight = params.get("weight");

      if (urlFamily || urlName) {
        const isPreg = urlMode === "pregnant";
        const syncedProfile = {
          name: urlName || "우리 아기",
          isPregnant: isPreg,
          gender: "girl",
          birthDate: !isPreg && urlDate ? urlDate : "2026-05-20",
          dueDate: isPreg && urlDate ? urlDate : "2026-05-20",
          weight: parseFloat(urlWeight) || 6.8,
          familyCode: urlFamily || "dani2026"
        };
        setProfile(syncedProfile);
        localStorage.setItem("datebaby_profile", JSON.stringify(syncedProfile));
        setSyncToast(`🎉 [${syncedProfile.name}] 가족 클라우드에 연결되었습니다!`);
        setTimeout(() => setSyncToast(""), 4000);
        return;
      }
    } catch (e) {}

    const saved = localStorage.getItem("datebaby_profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // 4. Firebase 실시간 클라우드 리스너
  useEffect(() => {
    if (!profile?.familyCode) return;

    const unsubscribe = listenToFamilyCloud(profile.familyCode, (cloudData) => {
      if (cloudData?.profile) {
        setProfile((prev) => ({
          ...prev,
          ...cloudData.profile
        }));
      }
      if (cloudData?.dailyLogs) {
        localStorage.setItem(
          "datebaby_daily_logs",
          JSON.stringify(cloudData.dailyLogs)
        );
      }
      if (cloudData?.completedVaccines) {
        localStorage.setItem(
          "datebaby_completed_vaccines",
          JSON.stringify(cloudData.completedVaccines)
        );
      }
    });

    return () => unsubscribe();
  }, [profile?.familyCode]);

  const handleSaveProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem("datebaby_profile", JSON.stringify(newProfile));
    if (newProfile.familyCode) {
      syncFamilyToCloud(newProfile.familyCode, { profile: newProfile });
    }
  };

  const handleAskAI = (question) => {
    setChatQuestion(question);
    setIsChatOpen(true);
  };

  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("datebaby_user", JSON.stringify(user));
    }
    setSyncToast(`🎉 ${user.displayName || "회원"}님 환영합니다!`);
    setTimeout(() => setSyncToast(""), 4000);

    // 사용자의 기존 등록 아기 코드가 있으면 자동 동기화
    if (user?.uid) {
      const uProfile = await getUserProfile(user.uid);
      if (uProfile?.familyCode) {
        setProfile((prev) => ({
          ...prev,
          familyCode: uProfile.familyCode
        }));
      }
    }
  };

  const status = calculateBabyStatus(profile, currentDate);
  const dailyGuide = getDailyGuide(status);

  const todayStr = formatISODate(new Date());
  const currentStr = formatISODate(currentDate);
  const isToday = todayStr === currentStr;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-3xl bg-amber-500/20 flex items-center justify-center animate-bounce">
            <span className="text-3xl">🍼</span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            데이트베이비 로딩 중...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans pb-28 selection:bg-amber-200">
      {/* 0. KakaoTalk in-app escape & smart PWA banner */}
      <KakaoInAppHandler onOpenPwa={() => setIsPwaOpen(true)} />

      {/* Cloud Sync Toast Notification */}
      {syncToast && (
        <div className="bg-emerald-600 text-white text-xs font-black px-4 py-2 text-center shadow-md animate-in slide-in-from-top flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* 1. Header */}
      <Header
        profile={profile}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenPwa={() => setIsPwaOpen(true)}
        onOpenWhiteNoise={() => setIsWhiteNoiseOpen(true)}
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
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("guide")}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === "guide"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            오늘 가이드
          </button>

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("log")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === "log"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Milk className="w-3.5 h-3.5" />
              데일리 기록
            </button>
          )}

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("growth")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === "growth"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              성장 도표
            </button>
          )}

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("vaccine")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === "vaccine"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              예방접종
            </button>
          )}

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("wonder")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
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
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
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

        {activeTab === "log" && !profile.isPregnant && (
          <DailyLogSection profile={profile} onAskAI={handleAskAI} />
        )}

        {activeTab === "growth" && !profile.isPregnant && (
          <GrowthCurveSection
            profile={profile}
            status={status}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === "vaccine" && !profile.isPregnant && (
          <VaccineSection profile={profile} onAskAI={handleAskAI} />
        )}

        {activeTab === "wonder" && !profile.isPregnant && (
          <WonderWeeksSection status={status} profile={profile} />
        )}

        {activeTab === "milestones" && !profile.isPregnant && (
          <MilestoneTracker profile={profile} />
        )}
      </main>

      {/* 5. Floating AI Coach FAB */}
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "guide"
                ? "text-amber-600 font-bold scale-105"
                : "text-slate-400 font-medium"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">오늘 가이드</span>
          </button>

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("log")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === "log"
                  ? "text-amber-600 font-bold scale-105"
                  : "text-slate-400 font-medium"
              }`}
            >
              <Milk className="w-5 h-5" />
              <span className="text-[10px]">기록/타이머</span>
            </button>
          )}

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("growth")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === "growth"
                  ? "text-amber-600 font-bold scale-105"
                  : "text-slate-400 font-medium"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px]">성장곡선</span>
            </button>
          )}

          {!profile.isPregnant && (
            <button
              onClick={() => setActiveTab("vaccine")}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === "vaccine"
                  ? "text-teal-600 font-bold scale-105"
                  : "text-slate-400 font-medium"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px]">예방접종</span>
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
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

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
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <PwaPrompt isOpen={isPwaOpen} onClose={() => setIsPwaOpen(false)} />

      <WhiteNoisePlayer
        isOpen={isWhiteNoiseOpen}
        onClose={() => setIsWhiteNoiseOpen(false)}
      />
    </div>
  );
}
