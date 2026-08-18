// app/api/version/route.js
import { NextResponse } from "next/server";

// 배포 시점마다 유일한 빌드 타임스탬프 생성
const BUILD_TIME = process.env.VERCEL_DEPLOYMENT_ID || Date.now().toString();

export async function GET() {
  return NextResponse.json(
    {
      version: BUILD_TIME,
      timestamp: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    }
  );
}
