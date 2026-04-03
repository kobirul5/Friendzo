import { cookies } from "next/headers";
import AdminCoinPriceManager from "@/components/shared/admin-coin-price-manager";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Server-side fetch for initial coin prices.
 */
async function getCoinPrices() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/coins`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const result = await res.json();
    // Assuming backend returns { success: true, data: [...] }
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.error("Failed to load coin prices server-side:", error);
    return [];
  }
}

export default async function CoinPricesPage() {
  const initialCoinPrices = await getCoinPrices();

  return (
    <div className="pb-10">
      <AdminCoinPriceManager initialCoinPrices={initialCoinPrices} />
    </div>
  );
}
