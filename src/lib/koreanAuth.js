// koreanAuth.js - 모바일 및 PC 완벽 지원 카카오/네이버 소셜 로그인 모듈
import { saveUserProfile, getUserProfile } from "@/lib/firebase";

export const KAKAO_JS_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "5ca87ef6ce909b4edf335ad5abc9806c";

export const NAVER_CLIENT_ID =
  process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "r4vm_43RmPIoawt4TcDs";

/**
 * 모바일 환경 감지 헬퍼
 */
export function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|KakaoTalk/i.test(
    navigator.userAgent
  );
}

/**
 * 네이버 1초 간편 로그인 (모바일 리다이렉트 + PC 팝업 듀얼 지원)
 */
export function loginWithNaver() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("브라우저 환경이 아닙니다."));
      return;
    }

    const state = Math.random().toString(36).substring(2, 10);
    localStorage.setItem("naver_oauth_state", state);

    const redirectUri = encodeURIComponent(window.location.origin);
    const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;

    // 모바일에서는 팝업 차단 및 opener 유실 방지를 위해 직접 리다이렉트
    if (isMobileDevice()) {
      window.location.href = authUrl;
      return;
    }

    // PC 브라우저: 팝업 실행
    const popup = window.open(
      authUrl,
      "naver_login_popup",
      "width=500,height=650,top=100,left=100"
    );

    if (!popup) {
      // 팝업 차단 시 리다이렉트로 자동 전환
      window.location.href = authUrl;
      return;
    }

    let isResolved = false;

    const messageHandler = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "NAVER_TOKEN" && event.data?.accessToken) {
        isResolved = true;
        window.removeEventListener("message", messageHandler);
        try {
          const res = await fetch("/api/auth/naver-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: event.data.accessToken })
          });

          if (res.ok) {
            const profileData = await res.json();
            const savedUser = await registerSocialUser(profileData);
            resolve(savedUser);
            return;
          }
        } catch (e) {
          console.warn("Fetch Naver Profile Error:", e);
        }

        reject(new Error("네이버 프로필을 가져오는데 실패했습니다."));
      }
    };

    window.addEventListener("message", messageHandler);

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setTimeout(() => {
          window.removeEventListener("message", messageHandler);
          if (!isResolved) {
            reject(new Error("로그인 창이 닫혔습니다."));
          }
        }, 800);
      }
    }, 800);
  });
}

/**
 * 카카오 1초 간편 로그인 (모바일 리다이렉트 + PC 팝업 듀얼 지원)
 */
export function loginWithKakao() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("브라우저 환경이 아닙니다."));
      return;
    }

    const state = Math.random().toString(36).substring(2, 10);
    const redirectUri = window.location.origin;
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_JS_KEY}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&state=${state}`;

    // 모바일에서는 팝업 차단 방지 및 매끄러운 1초 로그인을 위해 직접 리다이렉트
    if (isMobileDevice()) {
      window.location.href = authUrl;
      return;
    }

    // PC 브라우저: 팝업 실행
    const popup = window.open(
      authUrl,
      "kakao_login_popup",
      "width=480,height=620,top=100,left=100"
    );

    if (!popup) {
      window.location.href = authUrl;
      return;
    }

    let isResolved = false;

    const messageHandler = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "KAKAO_CODE" && event.data?.code) {
        isResolved = true;
        window.removeEventListener("message", messageHandler);
        try {
          const res = await fetch("/api/auth/kakao-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: event.data.code,
              redirectUri: window.location.origin
            })
          });

          if (res.ok) {
            const profileData = await res.json();
            const savedUser = await registerSocialUser(profileData);
            resolve(savedUser);
            return;
          }
        } catch (e) {
          console.warn("Fetch Kakao Profile Error:", e);
        }

        reject(new Error("카카오 프로필을 가져오는데 실패했습니다."));
      }
    };

    window.addEventListener("message", messageHandler);

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setTimeout(() => {
          window.removeEventListener("message", messageHandler);
          if (!isResolved) {
            reject(new Error("카카오 로그인 창이 닫혔습니다."));
          }
        }, 800);
      }
    }, 800);
  });
}

/**
 * 소셜 로그인 사용자 정보를 고유 고정 UID (예: kakao_12345, naver_67890)로 1:1 저장
 */
export async function registerSocialUser({
  uid,
  displayName,
  photoURL = null,
  provider = "social",
  kakaoId = null
}) {
  const existing = await getUserProfile(uid);
  const userObj = {
    uid,
    displayName: existing?.displayName || displayName || "회원",
    photoURL: existing?.photoURL || photoURL || null,
    provider,
    kakaoId: kakaoId || existing?.kakaoId || null,
    familyCode: existing?.familyCode || null,
    role: existing?.role || (typeof window !== "undefined" ? localStorage.getItem("datebaby_user_role") : null) || "mom",
    updatedAt: new Date().toISOString()
  };

  // Firestore `users/{uid}` 고유 문서에 덮어쓰기/병합
  await saveUserProfile(uid, userObj);

  if (typeof window !== "undefined") {
    localStorage.setItem("datebaby_user", JSON.stringify(userObj));
    if (userObj.role) {
      localStorage.setItem("datebaby_user_role", userObj.role);
    }
  }

  return userObj;
}
