"use client";

import React, { useState, useEffect } from "react";
import {
  Baby,
  Calendar,
  Weight,
  Sparkles,
  CheckCircle,
  Share2,
  Users,
  Copy,
  Check,
  X,
  User,
  LogIn,
  ShieldCheck,
  Heart,
  Send,
  Edit3
} from "lucide-react";
import { formatISODate } from "@/lib/dateUtils";
import {
  saveUserProfile,
  getUserProfile,
  registerFamilyMember,
  getFirebaseAuth,
  logoutUser
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onOpenAuth,
  onLogout
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
  const [userRole, setUserRole] = useState("mom"); // 'mom' | 'dad' | 'family'
  const [userNickname, setUserNickname] = useState("");
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
    const savedRole = localStorage.getItem("datebaby_user_role");
    if (savedRole) setUserRole(savedRole);

    const savedUser = localStorage.getItem("datebaby_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        if (u.displayName) setUserNickname(u.displayName);
      } catch (e) {}
    }
  }, [profile, isOpen]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const uProfile = await getUserProfile(user.uid);
        if (uProfile?.role) {
          setUserRole(uProfile.role);
          localStorage.setItem("datebaby_user_role", uProfile.role);
        }
        if (uProfile?.displayName) {
          setUserNickname(uProfile.displayName);
        } else if (user.displayName) {
          setUserNickname(user.displayName);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleRoleChange = async (role) => {
    setUserRole(role);
    localStorage.setItem("datebaby_user_role", role);
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem("datebaby_user", JSON.stringify(updatedUser));

      await saveUserProfile(currentUser.uid, {
        role,
        displayName: userNickname.trim() || currentUser.displayName || (role === "mom" ? "엄마" : "아빠"),
        email: currentUser.email || "",
        familyCode
      });
      await registerFamilyMember(familyCode, {
        uid: currentUser.uid,
        name: userNickname.trim() || currentUser.displayName || (role === "mom" ? "엄마" : role === "dad" ? "아빠" : "가족"),
        role: role === "mom" ? "엄마(아내)" : role === "dad" ? "아빠(남편)" : "가족/조부모",
        photoURL: currentUser.photoURL || null
      });
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserNickname("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("datebaby_user");
    }
    if (onLogout) onLogout();
  };

  const handleSubmit = async (e) => {
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

    // Save member info to cloud
    if (currentUser) {
      const updatedName =
        userNickname.trim() ||
        currentUser.displayName ||
        (userRole === "mom" ? "엄마" : "아빠");

      const updatedUser = {
        ...currentUser,
        displayName: updatedName,
        role: userRole,
        familyCode: newProfile.familyCode
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("datebaby_user", JSON.stringify(updatedUser));

      await saveUserProfile(currentUser.uid, {
        displayName: updatedName,
        role: userRole,
        familyCode: newProfile.familyCode
      });
      await registerFamilyMember(newProfile.familyCode, {
        uid: currentUser.uid,
        name: updatedName,
        role: userRole === "mom" ? "엄마(아내)" : userRole === "dad" ? "아빠(남편)" : "가족/조부모"
      });
    }

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
    const senderTitle = userRole === "mom" ? "엄마" : userRole === "dad" ? "아빠" : "가족";
    const receiverTitle = userRole === "mom" ? "아빠(남편)" : "엄마(아내)";

    if (navigator.share) {
      try {
        await navigator.share({
          title: `[데이트베이비] ${name}의 육아 일기 초대장`,
          text: `[데이트베이비] ${senderTitle}가 ${receiverTitle}를 우리 아기 [${name}]의 육아 일기에 초대했습니다! 링크를 누르면 실시간 부부 동기화가 자동 연결됩니다.`,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-amber-100 animate-in zoom-in-95">
        {/* Header */}
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
          {/* 1. Account & User Role Card */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="profile"
                      className="w-9 h-9 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {currentUser
                      ? userNickname || currentUser.displayName || currentUser.email || "로그인 계정"
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
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-black flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  로그인하기
                </button>
              )}
            </div>

            {/* My Nickname Input */}
            {currentUser && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-amber-600" />
                  <span>내 호칭 / 닉네임</span>
                </label>
                <input
                  type="text"
                  value={userNickname}
                  onChange={(e) => setUserNickname(e.target.value)}
                  placeholder="예: 수진, 동글이맘, 원배, 단이파파"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}

            {/* My Role in Parenting */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                내 역할 (수유/기저귀 기록 시 표시됩니다)
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRoleChange("mom")}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                    userRole === "mom"
                      ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  👩 엄마 (아내)
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("dad")}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                    userRole === "dad"
                      ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  👨 아빠 (남편)
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("family")}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                    userRole === "family"
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  👵 조부모/가족
                </button>
              </div>
            </div>
          </div>

          {/* 2. Family Sharing Cloud Code Card */}
          <div className="p-4 bg-linear-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <Users className="w-4 h-4 text-amber-600" />
                <span>부부 실시간 공유 (가족 코드)</span>
              </div>
              <span className="text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                1초 실시간 연동
              </span>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600">
                우리 부부 가족 코드 (양쪽 기기에 같은 코드 입력)
              </label>
              <input
                type="text"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                placeholder="예: dani2026"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-800 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 1-Click Couple Invite Button */}
            <button
              type="button"
              onClick={handleShareLink}
              className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>초대 링크 복사 완료! (카톡에 붙여넣기)</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    배우자에게 {userRole === "mom" ? "아빠" : "엄마"} 1초 초대장
                    보내기
                  </span>
                </>
              )}
            </button>
          </div>

          {/* 3. Life Stage: Pregnant vs Born */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              현재 아기 상태
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPregnant(true)}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  isPregnant
                    ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-xl">🤰</span>
                <span>임신 중 (출산 준비)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPregnant(false)}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  !isPregnant
                    ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-xl">👶</span>
                <span>출산 후 (육아 성장)</span>
              </button>
            </div>
          </div>

          {/* 4. Baby Name & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                아기 태명 / 이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 동글이"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                성별
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="girl">공주님 👧</option>
                <option value="boy">왕자님 👦</option>
              </select>
            </div>
          </div>

          {/* 5. Due Date or Birth Date */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{isPregnant ? "출산 예정일" : "아기 생년월일"}</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* 6. Current Weight (if born) */}
          {!isPregnant && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-slate-500" />
                <span>현재 몸무게 (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="6.8"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-bold text-xs transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-2 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs shadow-md shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>저장하고 적용하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
