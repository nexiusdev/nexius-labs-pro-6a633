import { NextResponse } from "next/server";
import { getAllRolesDb, getExpertByRoleMapDb } from "@/lib/catalog";

export async function GET() {
  const [roles, expertByRole] = await Promise.all([getAllRolesDb(), getExpertByRoleMapDb()]);
  return NextResponse.json({ roles, expertByRole });
}
