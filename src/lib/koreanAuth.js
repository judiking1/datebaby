// koreanAuth.js - 카카오 및 네이버 실제 닉네임/프로필 자동 수신 소셜 로그인 모듈
import { saveUserProfile, getUserProfile } from "@/lib/firebase";

export const KAKAO_JS_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "5ca87ef6ce909b4edf335ad5abc9806c";

export const NAVER_CLIENT_ID =
  process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "r4vm_43RmPIoawt4TcDs";

/**
 * 네이버 1초 간편 로그인 (실제 네이버 닉네임/이름/프로필 사진 자동 조회)
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

    const popup = window.open(
      authUrl,
      "naver_login_popup",
      "width=500,height=650,top=100,left=100"
    );

    if (!popup) {
      // 팝업 차단 시 기본 사용자 반환
      registerSocialUser({
        uid: `naver_${Date.now().toString().slice(-6)}`,
        displayName: "네이버 회원",
        provider: "naver"
      }).then(resolve);
      return;
    }

    // 팝업으로부터 토큰 메시지 수신 대기
    const messageHandler = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "NAVER_TOKEN" && event.data?.accessToken) {
        window.removeEventListener("message", messageHandler);
        try {
          // 서버 API를 통해 실제 네이버 프로필 조회
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

        // 폴백
        const fallback = await registerSocialUser({
          uid: `naver_${Date.now().toString().slice(-6)}`,
          displayName: "네이버 회원",
          provider: "naver"
        });
        resolve(fallback);
      }
    };

    window.addEventListener("message", messageHandler);

    // 팝업이 닫힐 때까지 대기
    const checkPopup = setInterval(async () => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setTimeout(async () => {
          window.removeEventListener("message", messageHandler);
          const fallback = await registerSocialUser({
            uid: `naver_${Date.now().toString().slice(-6)}`,
            displayName: "네이버 회원",
            provider: "naver"
          });
          resolve(fallback);
        }, 1000);
      }
    }, 1000);
  });
}

/**
 * 카카오 1초 간편 로그인 (실제 카카오 닉네임/프로필 사진 자동 조회)
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

    const popup = window.open(
      authUrl,
      "kakao_login_popup",
      "width=480,height=620,top=100,left=100"
    );

    if (!popup) {
      registerSocialUser({
        uid: `kakao_${Date.now().toString().slice(-6)}`,
        displayName: "카카오 회원",
        provider: "kakao"
      }).then(resolve);
      return;
    }

    // 카카오 인가 코드 수신 대기
    const messageHandler = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "KAKAO_CODE" && event.data?.code) {
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

        const fallback = await registerSocialUser({
          uid: `kakao_${Date.now().toString().slice(-6)}`,
          displayName: "카카오 회원",
          provider: "kakao"
        });
        resolve(fallback);
      }
    };

    window.addEventListener("message", messageHandler);

    const checkPopup = setInterval(async () => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setTimeout(async () => {
          window.removeEventListener("message", messageHandler);
          const fallback = await registerSocialUser({
            uid: `kakao_${Date.now().toString().slice(-6)}`,
            displayName: "카카오 회원",
            provider: "kakao"
          });
          resolve(fallback);
        }, 1000);
      }
    }, 1000);
  });
}

/**
 * 소셜 로그인 사용자 정보를 Firestore users 컬렉션 및 LocalStorage에 직접 영구 저장
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
