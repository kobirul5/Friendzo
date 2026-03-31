import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

import CompleteProfileForm from "@/components/complete-profile-form";
import { getProfile } from "@/services/user/profile-service";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type InterestItem = {
  name: string;
  image?: string | null;
};

async function getAllInterests(): Promise<InterestItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/discoverByInterest/all-interest`, {
      method: "GET",
      cache: "no-store",
    });

    const result = await res.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.error("Failed to fetch interests:", error);
    return [];
  }
}

export default async function CompleteProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  let decoded: { id?: string } | null = null;
  try {
    decoded = jwt.decode(accessToken) as { id?: string } | null;
  } catch {
    redirect("/login");
  }

  const userId = decoded?.id;
  if (!userId) {
    redirect("/login");
  }

  const [profile, interests] = await Promise.all([getProfile(userId), getAllInterests()]);

  if (!profile) {
    redirect("/profile");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(231,218,204,0.85),transparent_28%),radial-gradient(circle_at_top_right,rgba(216,203,191,0.7),transparent_24%),linear-gradient(180deg,#fbf7f2_0%,#f3ede6_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <CompleteProfileForm profile={profile} interests={interests} />
      </div>
    </main>
  );
}
