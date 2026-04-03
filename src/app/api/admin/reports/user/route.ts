import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * GET: Fetch reported users.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "";

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/report/user?page=${page}&limit=${limit}&search=${search}`,
      {
        headers: accessToken
          ? {
              Authorization: accessToken,
              "Content-Type": "application/json",
            }
          : undefined,
        cache: "no-store",
      }
    );

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to load user reports:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load user reports.", data: [] },
      { status: 500 }
    );
  }
}
