import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * GET: Fetch all payments from the backend.
 * Proxy to ${BASE_URL}/admin/payments or similar.
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
    );
  }

  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;
  
  // Try /admin/payment first as it's a common pattern in this app
  const endpoint = `${BASE_URL}/admin/payment?${searchParams.toString()}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    
    // If /admin/payment fails with 404, try /payments (plural) or /payment (singular)
    if (res.status === 404) {
      const altEndpoint = `${BASE_URL}/payment?${searchParams.toString()}`;
      const altRes = await fetch(altEndpoint, {
        headers: {
          Authorization: accessToken,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      const altResult = await altRes.json();
      return NextResponse.json(altResult, { status: altRes.status });
    }

    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to load admin payments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load payments.", data: null },
      { status: 500 }
    );
  }
}
