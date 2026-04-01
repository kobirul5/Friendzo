import { getProfile } from "@/services/user/profile-service";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { 
  UserCircle, 
  MapPin, 
  Calendar, 
  Settings, 
  Edit3, 
  Grid, 
  Info, 
  Heart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MemoryCard } from "@/components/profile/memory-card";
import { InterestBadge } from "@/components/profile/interest-badge";

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

type ProfileEvent = {
  id: string;
  image: string;
  description: string;
  createdAt: string;
};

type ProfileData = {
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

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  let decoded: (JwtPayload & { id?: string }) | null = null;
  try {
    const tokenPayload = jwt.decode(accessToken);
    decoded =
      tokenPayload && typeof tokenPayload !== "string"
        ? (tokenPayload as JwtPayload & { id?: string })
        : null;
  } catch {
    redirect("/login");
  }

  const userId = decoded?.id;
  if (!userId) {
    redirect("/login");
  }

  const profile = await getProfile(userId) as ProfileData | null;

  if (!profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <UserCircle className="h-20 w-20 text-muted" />
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || "User";
  const profileImage = profile.profileImage || undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Column: User Identity & Info */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white/50 backdrop-blur-xl">
            {/* Header Image Area */}
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
              
              {/* Floating Action Icons */}
              <div className="absolute top-6 right-6 flex gap-3">
                <Button size="icon" variant="secondary" className="rounded-2xl bg-white/40 backdrop-blur h-11 w-11 hover:bg-white/60">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>

              {/* Edit Floating Button */}
              <Link
                href="/complete-profile"
                className="absolute -bottom-6 right-8 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-linear-to-br from-primary to-primary-foreground text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                <Edit3 className="h-6 w-6" />
              </Link>
            </div>

            <CardContent className="pt-10 pb-8 px-8">
              {!profile.isProfileComplete ? (
                <div className="mb-6 rounded-[1.5rem] border border-primary/15 bg-primary/8 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Complete your profile</h2>
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
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30">
                    <Heart className="h-4 w-4 text-primary" />
                    <span>{profile.gender === "HER" ? "Female" : profile.gender === "HIM" ? "Male" : "Other"}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{profile.age} Years</span>
                  </div>
                  {profile.address && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Section */}
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

              {/* About Me Section */}
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">About me</h3>
                </div>
                <p className="text-muted-foreground/80 leading-relaxed text-[15px]">
                  {profile.about || "Life is a journey, and I’m enjoying every step of it. Let's connect and make some memories!"}
                </p>
              </div>

              {/* Interests Section */}
              <div className="mt-10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Interests</h3>
                  <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">View all</button>
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
                    <p className="col-span-3 text-sm text-muted-foreground italic">Add interests to see them here</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabbed Content & Events */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Main Tabs Area */}
          <div className="space-y-6">
            <div className="flex items-center gap-8 border-b pb-1">
              <button className="relative pb-4 text-lg font-black text-foreground after:absolute after:bottom-0 after:left-0 after:h-1.5 after:w-full after:rounded-full after:bg-primary">
                Memories
              </button>
              <button className="relative pb-4 text-lg font-bold text-muted-foreground transition-colors hover:text-foreground">
                Gifts
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {profile.memories?.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  image={memory.image}
                  description={memory.description}
                  userName={displayName}
                  userAvatar={profileImage}
                />
              ))}
              {(!profile.memories || profile.memories.length === 0) && (
                <Card className="col-span-2 border-dashed bg-muted/10 p-12 text-center">
                  <Grid className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold">No memories yet</h3>
                  <p className="text-sm text-muted-foreground">Share your first memory with the world!</p>
                </Card>
              )}
            </div>
          </div>

          {/* Events Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                Events Created
              </h2>
              <button className="text-sm font-bold uppercase tracking-widest text-primary hover:underline">View all</button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {profile.event?.map((item) => (
                <Card key={item.id} className="group overflow-hidden rounded-3xl border-none shadow-lg transition-all hover:scale-105 active:scale-95">
                  <div className="relative aspect-video w-full">
                    <Image src={item.image} alt="Event" fill className="object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold truncate line-clamp-1">{item.description}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
              {(!profile.event || profile.event.length === 0) && (
                <Card className="col-span-3 border-dashed bg-muted/10 p-8 text-center">
                  <p className="text-sm text-muted-foreground italic">No events organized yet</p>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
