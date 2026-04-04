import { cookies } from "next/headers";

import AdminGiftCardManager from "@/components/shared/admin-gift-card-manager";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type GiftCardItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: "ESSENTIAL" | "EXCLUSIVE" | "MAJESTIC";
  status: "ACTIVE" | "DELETED";
};

async function getAdminGiftCards(): Promise<GiftCardItem[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  try {
    const res = await fetch(`${BASE_URL}/gift-card`, {
      headers: accessToken
        ? {
            Authorization: accessToken,
            "Content-Type": "application/json",
          }
        : undefined,
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const result = await res.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.error("Failed to fetch admin gift cards:", error);
    return [];
  }
}

export default async function GiftCardsPage() {
  const giftCards = await getAdminGiftCards();

  return <AdminGiftCardManager initialGiftCards={giftCards} />;
}