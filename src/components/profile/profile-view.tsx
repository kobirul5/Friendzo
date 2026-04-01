import Link from "next/link";
import Image from "next/image";
import {
  UserCircle,
  MapPin,
  Calendar,
  Settings,
  Edit3,
  Info,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InterestBadge } from "@/components/profile/interest-badge";
import {
  ProfileTabs,
  type ProfileEvent,
  type ProfileMemory,
} from "@/components/profile/profile-tabs";

type InterestDetail = {
  id: string;
  name: string;
  image?: string | null;
};

export type ProfileViewData = {
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  gender?: "HER" | "HIM" | "EVERYONE" | null;
  age?: number | null;
  address?: string | null;
  followersCount: number;
  followingsCount: number;
  about?: string | null;
  interestsDetails?: InterestDetail[];
  memories?: ProfileMemory[];
  event?: ProfileEvent[];
  isProfileComplete?: boolean;
};

type ProfileViewProps = {
  profile: ProfileViewData;
  isOwnProfile?: boolean;
};

export function ProfileView({
  profile,
  isOwnProfile = false,
}: ProfileViewProps) {
  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || "User";
  const profileImage = profile.profileImage || undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-4">
          <Card className="overflow-hidden rounded-[2.5rem] border-none bg-white/50 shadow-2xl backdrop-blur-xl">
            <div className="relative aspect-square w-full">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/5">
                  <UserCircle className="h-32 w-32 text-primary/20" />
                </div>
              )}

              {isOwnProfile ? (
                <>
                  <div className="absolute right-6 top-6 flex gap-3">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-11 w-11 rounded-2xl bg-white/40 backdrop-blur hover:bg-white/60"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>

                  <Link
                    href="/complete-profile"
                    className="absolute -bottom-6 right-8 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-linear-to-br from-primary to-primary-foreground text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
                  >
                    <Edit3 className="h-6 w-6" />
                  </Link>
                </>
              ) : null}
            </div>

            <CardContent className="px-8 pb-8 pt-10">
              {isOwnProfile && !profile.isProfileComplete ? (
                <div className="mb-6 rounded-[1.5rem] border border-primary/15 bg-primary/8 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Complete your profile
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add your bio, interests, and details so people can discover you properly.
                      </p>
                    </div>
                    <Button asChild className="rounded-full">
                      <Link href="/complete-profile">Complete Profile</Link>
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-foreground">
                    {displayName}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                  <div className="rounded-xl bg-muted/30 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <span>
                        {profile.gender === "HER"
                          ? "Female"
                          : profile.gender === "HIM"
                            ? "Male"
                            : "Other"}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/30 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{profile.age ?? "N/A"} Years</span>
                    </div>
                  </div>
                  {profile.address ? (
                    <div className="rounded-xl bg-muted/30 px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{profile.address}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-1 rounded-3xl bg-muted/20 p-5 transition-colors hover:bg-primary/5">
                  <span className="text-2xl font-black text-primary">
                    {(profile.followersCount / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    Followers
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-3xl bg-muted/20 p-5 transition-colors hover:bg-primary/5">
                  <span className="text-2xl font-black text-primary">
                    {profile.followingsCount}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    Following
                  </span>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">About me</h3>
                </div>
                <p className="text-[15px] leading-relaxed text-muted-foreground/80">
                  {profile.about ||
                    "Life is a journey, and I'm enjoying every step of it. Let's connect and make some memories!"}
                </p>
              </div>

              <div className="mt-10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Interests</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {profile.interestsDetails?.slice(0, 3).map((interest) => (
                    <InterestBadge
                      key={interest.id}
                      name={interest.name}
                      image={interest.image || undefined}
                    />
                  ))}
                  {(!profile.interestsDetails || profile.interestsDetails.length === 0) && (
                    <p className="col-span-3 text-sm italic text-muted-foreground">
                      No interests added yet
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10 lg:col-span-8">
          <ProfileTabs
            memories={profile.memories}
            events={profile.event}
            displayName={displayName}
            profileImage={profileImage}
          />
        </div>
      </div>
    </div>
  );
}
