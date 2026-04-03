import Link from "next/link";
import { cookies } from "next/headers";
import { Compass } from "lucide-react";

import ContactsSidebar from "@/components/shared/contacts-sidebar";
import DiscoverExperienceClient from "@/components/shared/discover-experience-client";
import NavigationSidebar from "@/components/shared/navigation-sidebar";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type InterestItem = {
  name: string;
  image?: string | null;
};

async function getAllInterests(): Promise<InterestItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/discoverByInterest/all-interest`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const result = await res.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.error("Failed to fetch discover interests:", error);
    return [];
  }
}

export default async function ExplorePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const interests = await getAllInterests();

  if (!accessToken) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,#f6f1ea_0%,#efe6db_55%,#e8ddd1_100%)]">
        <div className="container mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="hidden xl:block" />
            <section className="min-w-0">
              <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
                <Compass className="mx-auto h-12 w-12 text-primary" />
                <h1 className="mt-4 text-2xl font-semibold text-foreground">
                  Please login to explore people
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse similar interests, nearby profiles, and today&apos;s buzz after signing in.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Go to login
                </Link>
              </div>
            </section>
            <aside className="hidden xl:block" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,#f6f1ea_0%,#efe6db_55%,#e8ddd1_100%)]">
      <div className="container mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <NavigationSidebar />

          <section className="min-w-0">
            <DiscoverExperienceClient interests={interests} />
          </section>

          <ContactsSidebar
            title="Explore mode"
            description="Switch between similar interests, nearby people, and today&apos;s buzz without leaving the page."
          />
        </div>
      </div>
    </main>
  );
}
