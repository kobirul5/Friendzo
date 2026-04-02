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

  const searchParams = request.nextUrl.searchParams;
  const params = new URLSearchParams();

  ["interest", "page", "limit"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      params.set(key, value);
    }
  });

  try {
    const res = await fetch(`${BASE_URL}/discoverByInterest/match?${params.toString()}`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to load discover matches:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load discover matches.", data: [] },
      { status: 500 }
    );
  }
}
