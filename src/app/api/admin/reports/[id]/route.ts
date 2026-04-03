import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * DELETE: Remove a report (works for both user and post reports).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: null },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${BASE_URL}/report/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: accessToken,
      },
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error(`Failed to delete report ${id}:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to delete report.", data: null },
      { status: 500 }
    );
  }
}
