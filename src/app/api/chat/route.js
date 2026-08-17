// route.js - Gemini API 채팅 엔드포인트
import { NextResponse } from "next/server";
import { askGeminiBabyCoach } from "@/lib/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, babyContext, history, apiKey } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "질문 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const answer = await askGeminiBabyCoach({
      message,
      babyContext,
      history,
      apiKey: apiKey || process.env.GEMINI_API_KEY
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "답변을 생성하는 도중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
