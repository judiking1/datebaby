// app/api/auth/naver-profile/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    // 네이버 사용자 프로필 조회 OpenAPI 호출
    const response = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch Naver profile", details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const naverUser = data.response || {};

    return NextResponse.json({
      uid: `naver_${naverUser.id}`,
      displayName: naverUser.nickname || naverUser.name || "네이버 회원",
      photoURL: naverUser.profile_image || null,
      email: naverUser.email || `naver_${naverUser.id}@datebaby.app`,
      provider: "naver",
    });
  } catch (error) {
    console.error("Naver Profile API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
