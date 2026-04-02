import { cookies } from "next/headers";

import AdminInterestManager from "@/components/shared/admin-interest-manager";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type InterestItem = {
  id: string;
  name: string;
  image?: string | null;
};

async function getAdminInterests(): Promise<InterestItem[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  try {
    const res = await fetch(`${BASE_URL}/admin/interest`, {
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
    console.error("Failed to fetch admin interests:", error);
    return [];
  }
}

export default async function InterestsPage() {
  const interests = await getAdminInterests();

  return <AdminInterestManager initialInterests={interests} />;
}
