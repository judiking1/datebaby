// app/api/auth/kakao-profile/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { accessToken, code, redirectUri } = await req.json();

    let token = accessToken;

    // 만약 code(인가 코드)로 넘어온 경우 토큰 발급
    if (code && !token) {
      const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id:
            process.env.NEXT_PUBLIC_KAKAO_JS_KEY ||
            "5ca87ef6ce909b4edf335ad5abc9806c",
          redirect_uri: redirectUri,
          code: code,
        }),
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        token = tokenData.access_token;
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Valid access token or code is required" },
        { status: 400 }
      );
    }

    // 카카오 사용자 정보 조회
    const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      return NextResponse.json(
        { error: "Failed to fetch Kakao user profile", details: errText },
        { status: userRes.status }
      );
    }

    const kakaoData = await userRes.json();
    const kakaoAccount = kakaoData.kakao_account || {};
    const profile = kakaoAccount.profile || {};

    return NextResponse.json({
      uid: `kakao_${kakaoData.id}`,
      displayName: profile.nickname || "카카오 회원",
      photoURL: profile.profile_image_url || profile.thumbnail_image_url || null,
      email: kakaoAccount.email || `kakao_${kakaoData.id}@datebaby.app`,
      provider: "kakao",
    });
  } catch (error) {
    console.error("Kakao Profile API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
