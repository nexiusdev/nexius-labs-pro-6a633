import { NextResponse } from "next/server";

// On 2026-03-10: Telegram onboarding form was removed from the web app.
// Keep this endpoint returning a clear error to avoid collecting bot tokens via the website.
export async function POST() {
  return NextResponse.json(
    { error: "Telegram onboarding has been removed. Please contact support for next steps." },
    { status: 410 }
  );
}
