import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * プロキシ経由でやり取りするレスポンスの基本型
 */
interface ProxyResponse {
  token?: string;
  [key: string]: unknown;
}

export async function ALL(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const path = route.join("/");
  const baseUrl = process.env.INTERNAL_API_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "INTERNAL_API_URL is missing" },
      { status: 500 }
    );
  }

  const targetUrl = `${baseUrl}/${path}`;
  const cookieStore = await cookies();

  // ログアウト処理の特例
  if (path === "auth/logout") {
    cookieStore.delete("token");
    cookieStore.delete("is_logged_in");
    return NextResponse.json({ success: true });
  }

  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: request.method !== "GET" ? await request.text() : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new NextResponse(errorText, { status: res.status });
    }

    // JSONをパースし、any ではなく ProxyResponse として扱う
    const data = (await res.json()) as ProxyResponse;

    const isAuth = path.includes("signin") || path.includes("signup");
    if (isAuth && typeof data.token === "string") {
      cookieStore.set("token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      // JSからログイン状態を確認するためのCookieを追加
      cookieStore.set("is_logged_in", "true", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1週間
        httpOnly: false, // JSから見えるようにする
        sameSite: "lax",
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy Error (${targetUrl}):`, error);
    return NextResponse.json({ error: "Gateway Error" }, { status: 502 });
  }
}

export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const DELETE = ALL;
export const PATCH = ALL;
