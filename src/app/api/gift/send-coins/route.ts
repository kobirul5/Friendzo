import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const receiverIds = Array.isArray(body?.receiverIds) ? body.receiverIds : [];
    const giftCardId = typeof body?.giftCardId === "string" ? body.giftCardId : "";

    if (!giftCardId || receiverIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Gift card ID and at least one receiver are required.", data: null },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE_URL}/gift/send-gift-with-coins`, {
      method: "POST",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ receiverIds, giftCardId }),
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to send gifts with coins:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send gifts.", data: null },
      { status: 500 }
    );
  }
}
