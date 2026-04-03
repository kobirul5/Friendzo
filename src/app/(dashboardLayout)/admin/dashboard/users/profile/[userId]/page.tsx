import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { InterestBadge } from "@/components/profile/interest-badge";
import { MemoryCard } from "@/components/profile/memory-card";
import { Coins, Heart, MapPin, Mars, UserCircle, Venus } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type InterestDetail = {
  id: string;
  name: string;
  image?: string | null;
};

type ProfileMemory = {
  id: string;
  image: string;
  description: string;
};

type ProfileGiftItem = {
  id?: string;
  name?: string | null;
  image?: string | null;
  price?: number | null;
  count?: number | null;
};

type AdminProfileData = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | "HER" | "HIM" | "EVERYONE" | null;
  age?: number | null;
  address?: string | null;
  followersCount?: number;
  followingsCount?: number;
  totalCoins?: number | null;
  about?: string | null;
  interestsDetails?: InterestDetail[];
  memories?: ProfileMemory[];
  gifts?: {
    purchases?: Record<string, ProfileGiftItem[]>;
    received?: Record<string, ProfileGiftItem[]>;
  };
};

function formatCompactNumber(value?: number | null) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

async function getAdminViewedUserProfile(userId: string): Promise<AdminProfileData | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const result = await res.json();
    return (result?.data ?? null) as AdminProfileData | null;
  } catch (error) {
    console.error("Failed to fetch admin viewed profile:", error);
    return null;
  }
}

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const profile = await getAdminViewedUserProfile(userId);

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-[1.8rem] border border-dashed border-border/70 bg-white/80 p-10 text-center">
        <UserCircle className="h-20 w-20 text-muted" />
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <Button asChild variant="outline">
          <Link href="/admin/dashboard/users">Back to users</Link>
        </Button>
      </div>
    );
  }

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || "Unknown User";
  const purchasedCards = Object.values(profile.gifts?.purchases || {}).flat();
  const memories = profile.memories || [];
  const interests = profile.interestsDetails || [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
          Profile Details
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          User Profile
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          <Link href="/admin/dashboard/users" className="text-primary hover:underline">
            All Social Users
          </Link>{" "}
          <span>/</span>{" "}
          <span>Profile</span>
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <div className="grid gap-5 md:grid-cols-[230px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[1.8rem] border border-black/5 ">
            <div className="relative aspect-[0.82] h-full">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={displayName}
                  fill
                  className="object-cover "
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/6">
                  <UserCircle className="h-24 w-24 text-primary/25" />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-black/5 bg-white/92 p-6 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.32)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  {displayName}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {profile.about || "No bio has been added for this user yet."}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-2 text-sm font-semibold text-primary">
                <Coins className="h-4 w-4" />
                {formatCompactNumber(profile.totalCoins)} Coins
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-foreground">
              <div className="inline-flex items-center gap-2">
                {(profile.gender === "FEMALE" || profile.gender === "HER") ? (
                  <Venus className="h-4 w-4 text-primary" />
                ) : (profile.gender === "MALE" || profile.gender === "HIM") ? (
                  <Mars className="h-4 w-4 text-primary" />
                ) : (
                  <Heart className="h-4 w-4 text-primary" />
                )}
                <span>
                  {profile.gender === "FEMALE" || profile.gender === "HER"
                    ? "Female"
                    : profile.gender === "MALE" || profile.gender === "HIM"
                      ? "Male"
                      : "Other"}
                </span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="text-primary">18+</span>
                <span>{profile.age ?? "N/A"}</span>
              </div>
              {profile.address ? (
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{profile.address}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-black/5 bg-background px-6 py-5 text-center">
                <p className="text-3xl font-semibold text-primary">
                  {formatCompactNumber(profile.followersCount)}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Followers
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-black/5 bg-background px-6 py-5 text-center">
                <p className="text-3xl font-semibold text-primary">
                  {formatCompactNumber(profile.followingsCount)}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Following
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-black/5 bg-white/92 p-6 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.32)]">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-foreground">Purchased Cards</h3>
            <div className="rounded-full border border-black/10 px-4 py-2 text-sm text-muted-foreground">
              All
            </div>
          </div>

          {purchasedCards.length > 0 ? (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {purchasedCards.map((card, index) => (
                <div
                  key={`${card.id || card.name || "gift"}-${index}`}
                  className="rounded-[1.25rem] border border-black/10 bg-background p-3 text-center"
                >
                  <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-2xl bg-primary/6">
                    {card.image ? (
                      <Image
                        src={card.image}
                        alt={card.name || "Gift card"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        🎁
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-muted-foreground">
                    {card.name || "Gift Card"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {Math.round(card.price ?? 0)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.4rem] border border-dashed border-primary/20 bg-primary/5 px-5 py-10 text-center text-sm text-muted-foreground">
              No purchased cards available for this user.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="border-b border-black/10 pb-3">
          <h3 className="text-lg font-semibold text-foreground">Uploaded Memories</h3>
        </div>

        {memories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                image={memory.image}
                description={memory.description}
                userName={displayName}
                userAvatar={profile.profileImage || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-primary/20 bg-white/70 px-5 py-10 text-center text-sm text-muted-foreground">
            No memories uploaded yet.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="border-b border-black/10 pb-3">
          <h3 className="text-lg font-semibold text-foreground">Uploaded Interests</h3>
        </div>

        {interests.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {interests.map((interest) => (
              <InterestBadge
                key={interest.id}
                name={interest.name}
                image={interest.image || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-primary/20 bg-white/70 px-5 py-10 text-center text-sm text-muted-foreground">
            No interests available for this user.
          </div>
        )}
      </section>
    </div>
  );
}
