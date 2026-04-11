import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const clearAuthCookies = (response: NextResponse) => {
  response.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
  response.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
  return response;
};

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return clearAuthCookies(
      NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
      )
    );
  }

  try {
    const decoded = jwt.decode(accessToken) as { id?: string } | null;
    const userId = decoded?.id;

    if (!userId) {
      return clearAuthCookies(
        NextResponse.json(
        { success: false, message: "Invalid token.", data: null },
        { status: 401 }
        )
      );
    }

    const res = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    if (res.status === 401 || res.status === 404) {
      return clearAuthCookies(NextResponse.json(result, { status: res.status }));
    }

    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return clearAuthCookies(
      NextResponse.json(
      { success: false, message: "Failed to fetch user data.", data: null },
      { status: 500 }
      )
    );
  }
}
