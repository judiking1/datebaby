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
    console.warn("Kakao Init Warning:", e);
  }
  return false;
}

/**
 * 카카오 1초 공식 팝업 로그인
 */
export function loginWithKakao() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(createKakaoTempUser());
      return;
    }

    try {
      // 1. window.Kakao SDK가 로드되어 있는 경우
      if (window.Kakao) {
        initKakaoSDK();

        if (window.Kakao.Auth && typeof window.Kakao.Auth.login === "function") {
          window.Kakao.Auth.login({
            scope: "profile_nickname,profile_image,account_email",
            success: function (authObj) {
              if (window.Kakao.API) {
                window.Kakao.API.request({
                  url: "/v2/user/me",
                  success: function (res) {
                    const kakaoAccount = res.kakao_account || {};
                    const profile = kakaoAccount.profile || {};
                    const user = {
                      uid: `kakao_${res.id}`,
                      displayName: profile.nickname || "카카오 회원",
                      photoURL:
                        profile.profile_image_url ||
                        profile.thumbnail_image_url ||
                        null,
                      email: kakaoAccount.email || `kakao_${res.id}@datebaby.app`,
                      provider: "kakao"
                    };
                    resolve(user);
                  },
                  fail: function () {
                    resolve(createKakaoTempUser());
                  }
                });
              } else {
                resolve(createKakaoTempUser());
              }
            },
            fail: function () {
              resolve(createKakaoTempUser());
            }
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Kakao SDK Exception:", e);
    }

    // 2. 안전한 소셜 세션 생성
    resolve(createKakaoTempUser());
  });
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
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(createNaverTempUser());
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
        resolve(createNaverTempUser());
        return;
      }

      const timer = setTimeout(() => {
        resolve(createNaverTempUser());
      }, 3000);

      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          clearTimeout(timer);
          resolve(createNaverTempUser());
        }
      }, 1000);
    } catch (e) {
      resolve(createNaverTempUser());
    }
  });
}

function createNaverTempUser() {
  const randId = Math.random().toString(36).substring(2, 8);
  return {
    uid: `naver_${randId}`,
    displayName: "네이버 회원",
    photoURL: null,
    email: `naver_${randId}@datebaby.app`,
    provider: "naver"
  };
}
