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
  AlertCircle,
  Loader2
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
  const [loadingProvider, setLoadingProvider] = useState(null); // 'kakao' | 'naver' | 'google' | 'email' | 'guest' | null
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleKakao = async () => {
    try {
      setLoadingProvider("kakao");
      setErrorMsg("");
      const user = await loginWithKakao();
      await saveUserProfile(user.uid, user);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      console.warn("Kakao Auth Error:", e);
      setErrorMsg(e?.message || "카카오 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleNaver = async () => {
    try {
      setLoadingProvider("naver");
      setErrorMsg("");
      const user = await loginWithNaver();
      await saveUserProfile(user.uid, user);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      console.warn("Naver Auth Error:", e);
      setErrorMsg(e?.message || "네이버 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoadingProvider("google");
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
      setLoadingProvider(null);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoadingProvider("email");
      setErrorMsg("");
      const user = await loginWithEmail(email.trim(), password);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      console.warn("Email Login Error:", e);
      if (e?.code === "auth/user-not-found" || e?.code === "auth/wrong-password" || e?.code === "auth/invalid-credential") {
        setErrorMsg("이메일 또는 비밀번호가 일치하지 않습니다.");
      } else {
        setErrorMsg(e?.message || "이메일 로그인에 실패했습니다.");
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg("닉네임(호칭)을 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("비밀번호는 최소 6자리 이상이어야 합니다.");
      return;
    }

    try {
      setLoadingProvider("email");
      setErrorMsg("");
      const user = await registerWithEmail(email.trim(), password, displayName.trim());
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      console.warn("Email SignUp Error:", e);
      if (e?.code === "auth/email-already-in-use") {
        setErrorMsg("이미 가입된 이메일 주소입니다. 로그인해주세요.");
      } else {
        setErrorMsg(e?.message || "회원가입에 실패했습니다.");
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGuest = async () => {
    try {
      setLoadingProvider("guest");
      setErrorMsg("");
      const user = await loginAsGuest();
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (e) {
      console.warn("Guest Login Error:", e);
      setErrorMsg(e?.message || "게스트 로그인 실패");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-amber-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center">
              <span className="text-lg">🍼</span>
            </div>
            <div>
              <h3 className="font-bold text-sm">데이트베이비 시작하기</h3>
              <p className="text-[10px] text-slate-400">
                로그인하고 배우자와 실시간으로 육아 데이터를 공유하세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setAuthMode("social");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              authMode === "social"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            간편 소셜 로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "email_signup" ? "email_signup" : "email_login");
              setErrorMsg("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              authMode !== "social"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            이메일 로그인
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-3.5">
          {/* Error Message Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === "social" ? (
            /* 1. Social Login Options */
            <div className="space-y-2.5">
              {/* Kakao 1-click */}
              <button
                type="button"
                onClick={handleKakao}
                disabled={loadingProvider === "kakao"}
                className="w-full py-3 px-4 rounded-2xl bg-[#FEE500] hover:bg-[#FDD835] active:scale-98 text-[#191919] font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {loadingProvider === "kakao" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.85 1.867 5.344 4.675 6.702-.195.734-.73 2.766-.838 3.197-.134.537.195.53.411.386.17-.113 2.721-1.854 3.823-2.613.623.088 1.268.128 1.929.128 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
                  </svg>
                )}
                <span>카카오로 1초 시작하기</span>
              </button>

              {/* Naver 1-click */}
              <button
                type="button"
                onClick={handleNaver}
                disabled={loadingProvider === "naver"}
                className="w-full py-3 px-4 rounded-2xl bg-[#03C75A] hover:bg-[#02B150] active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {loadingProvider === "naver" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
                  </svg>
                )}
                <span>네이버로 1초 시작하기</span>
              </button>

              {/* Google Account */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loadingProvider === "google"}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 active:scale-98 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all disabled:opacity-50"
              >
                {loadingProvider === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Google 계정으로 시작하기</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode("email_login")}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  이메일 주소로 로그인 / 회원가입
                </button>
              </div>
            </div>
          ) : authMode === "email_login" ? (
            /* 2. Email Login Form */
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">이메일</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">비밀번호</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingProvider === "email"}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loadingProvider === "email" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>로그인</span>
              </button>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setAuthMode("email_signup")}
                  className="hover:text-slate-900 font-bold"
                >
                  계정이 없으신가요? <span className="text-amber-600 underline">회원가입</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("social")}
                  className="hover:text-slate-900 underline"
                >
                  소셜 로그인으로
                </button>
              </div>
            </form>
          ) : (
            /* 3. Email Sign-Up Form */
            <form onSubmit={handleEmailSignUp} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">호칭 / 닉네임</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="예: 동글이맘, 수진, 단이아빠"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">이메일</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">비밀번호 (6자 이상)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingProvider === "email"}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loadingProvider === "email" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>간편 회원가입 완료</span>
              </button>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setAuthMode("email_login")}
                  className="hover:text-slate-900 font-bold"
                >
                  이미 계정이 있으신가요? <span className="text-slate-800 underline">로그인</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("social")}
                  className="hover:text-slate-900 underline"
                >
                  소셜 로그인으로
                </button>
              </div>
            </form>
          )}

          {/* Guest fallback link */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleGuest}
              disabled={loadingProvider === "guest"}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              로그인 없이 게스트로 둘러보기 &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
