import { NextResponse } from "next/server";
import { getAllExpertsDb } from "@/lib/catalog";

export async function GET() {
  const experts = await getAllExpertsDb();
  return NextResponse.json({ experts });
}
