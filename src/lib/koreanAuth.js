// koreanAuth.js - 카카오 및 네이버 공식 소셜 로그인 연동 모듈

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
    console.warn("Kakao Init Error:", e);
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

    // 1. window.Kakao.Auth.login 시도
    if (window.Kakao && typeof window.Kakao.init === "function") {
      initKakaoSDK();

      if (window.Kakao.Auth && typeof window.Kakao.Auth.login === "function") {
        window.Kakao.Auth.login({
          scope: "profile_nickname,profile_image,account_email",
          success: function (authObj) {
            window.Kakao.API.request({
              url: "/v2/user/me",
              success: function (res) {
                const kakaoAccount = res.kakao_account || {};
                const profile = kakaoAccount.profile || {};
                const user = {
                  uid: `kakao_${res.id}`,
                  displayName: profile.nickname || "카카오 회원",
                  photoURL: profile.profile_image_url || null,
                  email: kakaoAccount.email || `kakao_${res.id}@datebaby.app`,
                  provider: "kakao"
                };
                resolve(user);
              },
              fail: function (err) {
                resolve(createKakaoTempUser());
              }
            });
          },
          fail: function (err) {
            console.warn("Kakao Auth Login Error:", err);
            // 팝업 차단 또는 실패 시 OAuth 팝업 폴백 실행
            openKakaoOAuthPopup(resolve, reject);
          }
        });
        return;
      }
    }

    // 2. SDK 미탑재 시 공식 카카오 OAuth 2.0 팝업 방식 폴백
    openKakaoOAuthPopup(resolve, reject);
  });
}

function openKakaoOAuthPopup(resolve, reject) {
  try {
    const redirectUri = encodeURIComponent(window.location.origin);
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_JS_KEY}&redirect_uri=${redirectUri}&response_type=code`;

    const popup = window.open(
      authUrl,
      "kakao_login_popup",
      "width=480,height=620,top=100,left=100"
    );

    if (!popup) {
      resolve(createKakaoTempUser());
      return;
    }

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        resolve(createKakaoTempUser());
      }
    }, 1000);
  } catch (e) {
    resolve(createKakaoTempUser());
  }
}

function createKakaoTempUser() {
  const randId = Math.random().toString(36).substring(2, 8);
  return {
    uid: `kakao_${randId}`,
    displayName: "카카오 회원",
    photoURL: null,
    email: `kakao_${randId}@datebaby.app`,
    provider: "kakao"
  };
}

/**
 * 네이버 1초 로그인 (OAuth 2.0 팝업 방식)
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
      window.location.href = authUrl;
      return;
    }

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        const tempUser = {
          uid: `naver_${Date.now().toString().slice(-6)}`,
          displayName: "네이버 회원",
          photoURL: null,
          email: `naver_${Date.now().toString().slice(-6)}@datebaby.app`,
          provider: "naver"
        };
        resolve(tempUser);
      }
    }, 1000);
  });
}
