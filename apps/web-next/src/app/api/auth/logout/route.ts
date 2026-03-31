import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * ログアウトを行い、トークン（クッキー）を削除します
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return NextResponse.json({ success: true });
}
