import { cookies } from "next/headers";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getProfile } from "@/services/user/profile-service";
import AdminSettingsManager from "@/components/shared/admin-settings-manager";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  let user = null;

  if (accessToken) {
    try {
      const decoded = jwt.decode(accessToken);

      if (decoded && typeof decoded !== "string") {
        const payload = decoded as JwtPayload & {
          id?: string;
          email?: string;
          role?: string;
        };
        const profile = payload.id ? await getProfile(payload.id) : null;

        user = {
          firstName: profile?.firstName || null,
          lastName: profile?.lastName || null,
          email: profile?.email || payload.email || null,
          profileImage: profile?.profileImage || null,
          phoneNumber: profile?.phoneNumber || null,
          role: typeof payload.role === "string" ? payload.role : "Admin",
        };
      }
    } catch (error) {
      console.error("JWT Decode Error in admin settings page:", error);
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-[2rem] border border-dashed border-border/70 bg-white/80">
        <p className="text-muted-foreground">User profile not found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminSettingsManager user={user} />
    </div>
  );
}
