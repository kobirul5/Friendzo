import AdminDashboardSidebar from "@/components/shared/admin-dashboard-sidebar";
import { cookies } from "next/headers";
import Image from "next/image";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Toaster } from "sonner";

import { getProfile } from "@/services/user/profile-service";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

type AdminLayoutUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
  role?: string | null;
};

export default async function Layout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  let user: AdminLayoutUser | null = null;

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
          role: typeof payload.role === "string" ? payload.role : "Admin",
        };
      }
    } catch (error) {
      console.error("JWT Decode Error in admin dashboard layout:", error);
    }
  }

  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Admin User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = user?.role || "Admin";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f2ec_0%,#f1ebe2_48%,#ebe1d4_100%)] text-foreground">
      <Toaster position="top-right" richColors />
      <div className="grid min-h-screen lg:grid-cols-[290px_minmax(0,1fr)]">
        <AdminDashboardSidebar user={user} />

        <div className="relative z-0 min-w-0">
          <header className="sticky top-0 z-50 flex flex-col gap-4 border-b border-black/5 bg-white/90 px-5 py-5 backdrop-blur-md sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Admin workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Dashboard Management
              </h2>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-white/90 px-4 py-3 shadow-[0_18px_45px_-35px_rgba(95,76,55,0.35)] sm:justify-start">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[linear-gradient(135deg,#ead8c2,#c7a783)]">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={userName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
                    {userInitial}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || userRole}
                </p>
              </div>
            </div>
          </header>

          <main className="relative z-0 px-5 py-6 sm:px-8">
            <div className="rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-[0_24px_60px_-45px_rgba(95,76,55,0.45)] backdrop-blur-md sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
