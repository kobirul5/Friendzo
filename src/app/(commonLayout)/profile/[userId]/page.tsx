import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/services/user/profile-service";
import { ProfileView, type ProfileViewData } from "@/components/profile/profile-view";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  if (!userId) {
    redirect("/profile");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  let currentUserId: string | null = null;

  if (accessToken) {
    try {
      const decoded = jwt.decode(accessToken) as { id?: string } | null;
      currentUserId = decoded?.id || null;
    } catch (error) {
      console.error("JWT decode error:", error);
    }
  }

  const isOwnProfile = currentUserId === userId;

  const profile = (await getProfile(userId)) as ProfileViewData | null;
  console.log("Profile Data from Backend:", profile);

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

  const profileWithId = {
    ...profile,
    userId: userId,
  };

  return <ProfileView profile={profileWithId} isOwnProfile={isOwnProfile} />;
}
