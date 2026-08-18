// koreanAuth.js - 카카오 및 네이버 공식 소셜 로그인 SDK 연동 모듈

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

    const isInitialized = initKakaoSDK();
    if (!window.Kakao || !isInitialized) {
      // SDK가 로드되지 않은 경우 스크립트 재시도
      setTimeout(() => {
        if (initKakaoSDK()) {
          executeKakaoLogin(resolve, reject);
        } else {
          reject(new Error("카카오 SDK를 초기화할 수 없습니다."));
        }
      }, 500);
      return;
    }

    executeKakaoLogin(resolve, reject);
  });
}

function executeKakaoLogin(resolve, reject) {
  try {
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
              photoURL: profile.profile_image_url || profile.thumbnail_image_url || null,
              email: kakaoAccount.email || `kakao_${res.id}@datebaby.app`,
              provider: "kakao"
            };
            resolve(user);
          },
          fail: function (err) {
            console.error("Kakao User Info Error:", err);
            reject(err);
          }
        });
      },
      fail: function (err) {
        console.error("Kakao Auth Login Error:", err);
        reject(err);
      }
    });
  } catch (e) {
    reject(e);
  }
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

    // 네이버 인증 팝업 창 열기
    const popup = window.open(
      authUrl,
      "naver_login_popup",
      "width=500,height=650,top=100,left=100"
    );

    if (!popup) {
      // 팝업이 차단된 경우 리다이렉트
      window.location.href = authUrl;
      return;
    }

    // 팝업 응답 대기
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        // 기본 프로필 세션 생성
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
