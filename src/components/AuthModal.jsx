"use client";

import React, { useState } from "react";
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAsGuest,
  saveUserProfile
} from "@/lib/firebase";
import { loginWithKakao, loginWithNaver } from "@/lib/koreanAuth";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [authMode, setAuthMode] = useState("social"); // 'social' | 'email_login' | 'email_signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleKakao = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const user = await loginWithKakao();
      await saveUserProfile(user.uid, user);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      console.warn("Kakao Auth Error:", e);
      setErrorMsg(e?.message || "카카오 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleNaver = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const user = await loginWithNaver();
      await saveUserProfile(user.uid, user);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      console.warn("Naver Auth Error:", e);
      setErrorMsg(e?.message || "네이버 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const user = await loginWithGoogle();
      await saveUserProfile(user.uid, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        provider: "google"
      });
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      console.warn("Google Auth Error:", e);
      if (
        e?.code === "auth/configuration-not-found" ||
        e?.message?.includes("configuration-not-found")
      ) {
        setErrorMsg(
          "Firebase 콘솔에서 Google 로그인이 활성화되지 않았습니다. [카카오 로그인] 또는 [이메일 간편 가입]을 이용해주세요!"
        );
      } else {
        setErrorMsg(e?.message || "Google 로그인에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg("");
      const user = await loginWithEmail(email, password);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      setErrorMsg(
        e.code === "auth/invalid-credential" || e.code === "auth/user-not-found"
          ? "이메일 또는 비밀번호가 일치하지 않습니다."
          : e.message || "로그인에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("비밀번호는 최소 6자리 이상 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const user = await registerWithEmail(
        email,
        password,
        displayName || "데이트베이비 회원"
      );
      await saveUserProfile(user.uid, {
        uid: user.uid,
        displayName: displayName || "데이트베이비 회원",
        email: user.email,
        provider: "email"
      });
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      setErrorMsg(
        e.code === "auth/email-already-in-use"
          ? "이미 등록된 이메일 주소입니다. 로그인을 진행해주세요."
          : e.message || "회원가입에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const user = await loginAsGuest();
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center">
              <span className="text-lg">🍼</span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm">데이트베이비 시작하기</h3>
              <p className="text-[11px] text-slate-300">
                로그인하고 배우자와 실시간으로 육아 데이터를 공유하세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex gap-1.5">
          <button
            onClick={() => {
              setAuthMode("social");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              authMode === "social"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            간편 소셜 로그인
          </button>
          <button
            onClick={() => {
              setAuthMode("email_login");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              authMode === "email_login" || authMode === "email_signup"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            이메일 로그인
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 bg-white text-slate-800">
          {/* Error Message Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === "social" && (
            <div className="space-y-2.5">
              {/* 1. Kakao Official Login Button */}
              <button
                onClick={handleKakao}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-xs rounded-2xl flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all"
              >
                <svg
                  className="w-4 h-4 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 3C6.477 3 2 6.477 2 10.765c0 2.76 1.84 5.176 4.63 6.556l-1.18 4.354c-.1.38.33.68.65.47l5.22-3.46c.22.02.45.03.68.03 5.523 0 10-3.477 10-7.765S17.523 3 12 3z" />
                </svg>
                카카오로 1초 시작하기
              </button>

              {/* 2. Naver Official Login Button */}
              <button
                onClick={handleNaver}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#03C75A] hover:bg-[#02B350] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all"
              >
                <span className="font-black text-sm shrink-0">N</span>
                네이버로 1초 시작하기
              </button>

              {/* 3. Google Login Button */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2.5 border border-slate-300 shadow-2xs active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Google 계정으로 시작하기
              </button>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setAuthMode("email_login")}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  이메일 주소로 로그인 / 회원가입
                </button>
              </div>
            </div>
          )}

          {/* Email Login Form */}
          {authMode === "email_login" && (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  이메일 주소
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="example@naver.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="비밀번호 6자리 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all mt-2"
              >
                <LogIn className="w-4 h-4" />
                이메일로 로그인
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("social")}
                  className="hover:underline"
                >
                  소셜 간편 로그인
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("email_signup")}
                  className="font-bold text-slate-900 hover:underline"
                >
                  아직 계정이 없으신가요? <strong>회원가입</strong>
                </button>
              </div>
            </form>
          )}

          {/* Email Signup Form */}
          {authMode === "email_signup" && (
            <form onSubmit={handleEmailSignup} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  닉네임 / 성함
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="예: 단이맘, 콩콩파파"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  이메일 주소
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="example@naver.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  비밀번호 설정
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="최소 6자리 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all mt-2"
              >
                <UserPlus className="w-4 h-4" />
                3초 만에 회원가입 완료
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("email_login")}
                  className="text-xs text-slate-600 hover:underline"
                >
                  이미 계정이 있으신가요? <strong>로그인하기</strong>
                </button>
              </div>
            </form>
          )}

          {/* Guest Button */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={handleGuest}
              className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors"
            >
              로그인 없이 게스트로 둘러보기 &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
