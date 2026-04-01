import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import MessagesPageClient from "@/components/messages-page-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default async function MessagesPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value || null;
  let currentUserId: string | null = null;

  if (accessToken) {
    try {
      const decoded = jwt.decode(accessToken) as { id?: string } | null;
      currentUserId = decoded?.id || null;
    } catch {
      currentUserId = null;
    }
  }

  const socketUrl = API_URL.replace("/api/v1", "").replace(/^http/, "ws");

  return (
    <MessagesPageClient
      accessToken={accessToken}
      currentUserId={currentUserId}
      socketUrl={socketUrl}
    />
  );
}
