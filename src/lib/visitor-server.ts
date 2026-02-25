import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const VISITOR_COOKIE = "nexius_vid";

export function resolveVisitorId(req: NextRequest, fallback?: string | null) {
  const fromCookie = req.cookies.get(VISITOR_COOKIE)?.value;
  const fromFallback = fallback?.trim();
  return fromCookie || fromFallback || randomUUID();
}

export function attachVisitorCookie(res: NextResponse, visitorId: string) {
  res.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
