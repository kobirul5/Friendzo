import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: [] },
      { status: 401 }
    );
  }

  const requestUrl = new URL(request.url);
  const search = requestUrl.searchParams.get("search") || "";
  const blocked = requestUrl.searchParams.get("blocked") || "";
  const upstreamParams = new URLSearchParams();

  if (search) {
    upstreamParams.set("search", search);
  }

  if (blocked) {
    upstreamParams.set("blocked", blocked);
  }

  const query = upstreamParams.toString();
  const endpoint = `${BASE_URL}/users${query ? `?${query}` : ""}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to load admin users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load users.", data: [] },
      { status: 500 }
    );
  }
}
