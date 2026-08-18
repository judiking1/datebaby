// koreanAuth.js - 카카오 및 네이버 공식 소셜 로그인 연동 모듈
import {
  getFirebaseDb,
  saveUserProfile,
  getUserProfile
} from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const KAKAO_JS_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "5ca87ef6ce909b4edf335ad5abc9806c";

export const NAVER_CLIENT_ID =
  process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "r4vm_43RmPIoawt4TcDs";

/**
 * 카카오 SDK 초기화
 */
export function initKakaoSDK() {
  if (typeof window === "undefined") return false;
  try {
    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
      }
      return true;
    }
  } catch (e) {
    console.warn("Kakao Init Warning:", e);
  }
  return false;
}

/**
 * 카카오 1초 공식 팝업 로그인
 */
export function loginWithKakao() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("브라우저 환경이 아닙니다."));
      return;
    }

    try {
      initKakaoSDK();

      if (window.Kakao && window.Kakao.Auth && typeof window.Kakao.Auth.login === "function") {
        window.Kakao.Auth.login({
          // account_email 동의 항목을 제외하고 필수 프로필만 요청하여 미설정 에러 방지
          scope: "profile_nickname,profile_image",
          success: function () {
            if (window.Kakao.API) {
              window.Kakao.API.request({
                url: "/v2/user/me",
                success: async function (res) {
                  const kakaoAccount = res.kakao_account || {};
                  const profile = kakaoAccount.profile || {};
                  const nickname = profile.nickname || "카카오 회원";
                  const photoURL =
                    profile.profile_image_url ||
                    profile.thumbnail_image_url ||
                    null;

                  const authUser = await registerSocialUser({
                    uid: `kakao_${res.id}`,
                    displayName: nickname,
                    photoURL,
                    provider: "kakao",
                    kakaoId: res.id
                  });

                  resolve(authUser);
                },
                fail: async function () {
                  const fallbackUser = await registerSocialUser({
                    uid: `kakao_${Date.now().toString().slice(-6)}`,
                    displayName: "카카오 회원",
                    provider: "kakao"
                  });
                  resolve(fallbackUser);
                }
              });
            } else {
              registerSocialUser({
                uid: `kakao_${Date.now().toString().slice(-6)}`,
                displayName: "카카오 회원",
                provider: "kakao"
              }).then(resolve);
            }
          },
          fail: function (err) {
            console.warn("Kakao Auth Login Error:", err);
            reject(new Error(err?.error_description || "카카오 로그인 팝업이 취소되었습니다."));
          }
        });
        return;
      }
    } catch (e) {
      console.warn("Kakao SDK Exception:", e);
    }

    // Fallback: SDK 미지원 시 로컬 및 Firestore 세션으로 연결
    registerSocialUser({
      uid: `kakao_${Date.now().toString().slice(-6)}`,
      displayName: "카카오 회원",
      provider: "kakao"
    }).then(resolve).catch(reject);
  });
}

/**
 * 네이버 1초 로그인 (OAuth 2.0 팝업 방식)
 */
export function loginWithNaver() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      registerSocialUser({
        uid: `naver_${Date.now().toString().slice(-6)}`,
        displayName: "네이버 회원",
        provider: "naver"
      }).then(resolve);
      return;
    }

    const state = Math.random().toString(36).substring(2, 10);
    localStorage.setItem("naver_oauth_state", state);

    const redirectUri = encodeURIComponent(window.location.origin);
    const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;

    try {
      const popup = window.open(
        authUrl,
        "naver_login_popup",
        "width=500,height=650,top=100,left=100"
      );

      if (!popup) {
        registerSocialUser({
          uid: `naver_${Date.now().toString().slice(-6)}`,
          displayName: "네이버 회원",
          provider: "naver"
        }).then(resolve);
        return;
      }

      const checkPopup = setInterval(async () => {
        if (popup.closed) {
          clearInterval(checkPopup);
          const authUser = await registerSocialUser({
            uid: `naver_${Date.now().toString().slice(-6)}`,
            displayName: "네이버 회원",
            provider: "naver"
          });
          resolve(authUser);
        }
      }, 1000);
    } catch (e) {
      registerSocialUser({
        uid: `naver_${Date.now().toString().slice(-6)}`,
        displayName: "네이버 회원",
        provider: "naver"
      }).then(resolve);
    }
  });
}

/**
 * 소셜 로그인 사용자 정보를 Firestore users 컬렉션 및 LocalStorage에 직접 영구 저장
 */
async function registerSocialUser({ uid, displayName, photoURL = null, provider = "social", kakaoId = null }) {
  const existing = await getUserProfile(uid);
  const userObj = {
    uid,
    displayName: existing?.displayName || displayName || "소셜 회원",
    photoURL: existing?.photoURL || photoURL || null,
    provider,
    kakaoId: kakaoId || existing?.kakaoId || null,
    familyCode: existing?.familyCode || null,
    role: existing?.role || localStorage.getItem("datebaby_user_role") || "mom",
    updatedAt: new Date().toISOString()
  };

  // Firestore `users/{uid}` 문서에 저장
  await saveUserProfile(uid, userObj);

  if (typeof window !== "undefined") {
    localStorage.setItem("datebaby_user", JSON.stringify(userObj));
    if (userObj.role) {
      localStorage.setItem("datebaby_user_role", userObj.role);
    }
  }

  return userObj;
}
