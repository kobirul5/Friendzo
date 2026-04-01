import Link from "next/link";
import { redirect } from "next/navigation";
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

  const profile = (await getProfile(userId)) as ProfileViewData | null;

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

  return <ProfileView profile={profile} />;
}
