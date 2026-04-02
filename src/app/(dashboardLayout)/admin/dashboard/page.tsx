import { cookies } from "next/headers";
import { Activity, Coins, CreditCard, Gift, ShieldAlert, Users } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type DashboardUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
};

type DashboardPayload = {
  stats?: {
    totalRevenue?: number | null;
    totalUsers?: number;
    totalVisitors?: number;
    newUsers?: number;
    totalCoinSales?: number | null;
    totalDatingUsers?: number;
    totalSocialUsers?: number;
    totalGiftCard?: number;
    totalBlockedUsers?: number;
    totalInactiveUsers?: number;
  };
  meta?: {
    page?: number;
    limit?: number;
    totalUsers?: number;
    totalPages?: number;
  };
  data?: DashboardUser[];
};

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

async function getDashboardData(): Promise<DashboardPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/dashboard?page=1&limit=8`, {
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
    return result?.data ?? null;
  } catch (error) {
    console.error("Failed to load admin dashboard stats:", error);
    return null;
  }
}

export default async function Page() {
  const dashboard = await getDashboardData();
  const stats = dashboard?.stats;
  const users = dashboard?.data ?? [];
  const overviewCards = [
    { label: "Total Revenue", value: formatCurrency(stats?.totalRevenue), icon: CreditCard },
    { label: "Total Users", value: formatNumber(stats?.totalUsers), icon: Users },
    { label: "Total Visitors", value: formatNumber(stats?.totalVisitors), icon: Activity },
    { label: "New Users", value: formatNumber(stats?.newUsers), icon: Users },
    { label: "Total Coin Sales", value: formatNumber(stats?.totalCoinSales), icon: Coins },
    { label: "Dating Users", value: formatNumber(stats?.totalDatingUsers), icon: Users },
    { label: "Gift Cards", value: formatNumber(stats?.totalGiftCard), icon: Gift },
    { label: "Blocked Users", value: formatNumber(stats?.totalBlockedUsers), icon: ShieldAlert },
  ];

  if (!dashboard || !stats) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-border/70 bg-white/80 p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
          Dashboard Home
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Dashboard data unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin stats could not be loaded from the `/dashboard` route right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Dashboard Home
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Hello, Jhon Son!
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Live admin overview loaded from the `/dashboard` response with current platform stats and latest users.
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-primary/10 bg-primary/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
            Overview
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Page {dashboard.meta?.page ?? 1} of {dashboard.meta?.totalPages ?? 1}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-[1.5rem] border border-black/5 bg-white/92 p-4 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.32)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <div className="rounded-full bg-primary/8 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold text-foreground">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="rounded-[1.8rem] border border-black/5 bg-white/92 p-5 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.32)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                New Users
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Recent active users</h2>
            </div>
            <div className="rounded-full bg-primary/7 px-4 py-2 text-sm text-muted-foreground">
              {users.length} shown
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-black/5">
            <div className="grid grid-cols-[88px_minmax(0,1.2fr)_minmax(0,1.5fr)_120px] gap-3 bg-primary/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
              <span>ID</span>
              <span>User Name</span>
              <span>Email</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-black/5">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[88px_minmax(0,1.2fr)_minmax(0,1.5fr)_120px] gap-3 px-4 py-4 text-sm"
                >
                  <span className="truncate text-muted-foreground">{user.id.slice(0, 8)}</span>
                  <span className="truncate font-medium text-foreground">
                    {[user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown User"}
                  </span>
                  <span className="truncate text-muted-foreground">{user.email || "No email"}</span>
                  <span className="inline-flex max-w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-[1.8rem] border border-black/5 bg-white/92 p-5 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.32)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
              User Mix
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[1.4rem] bg-primary/6 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Social Users</span>
                  <span className="text-lg font-semibold text-primary">
                    {formatNumber(stats.totalSocialUsers)}
                  </span>
                </div>
              </div>
              <div className="rounded-[1.4rem] bg-primary/6 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Dating Users</span>
                  <span className="text-lg font-semibold text-primary">
                    {formatNumber(stats.totalDatingUsers)}
                  </span>
                </div>
              </div>
              <div className="rounded-[1.4rem] bg-primary/6 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Inactive Users</span>
                  <span className="text-lg font-semibold text-primary">
                    {formatNumber(stats.totalInactiveUsers)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-black/5 bg-[linear-gradient(180deg,rgba(109,87,67,0.1),rgba(109,87,67,0.04))] p-5 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.32)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
              Sales Snapshot
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.4rem] bg-white/85 p-4">
                <p className="text-sm text-muted-foreground">Coin Sales</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatNumber(stats.totalCoinSales)}
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-white/85 p-4">
                <p className="text-sm text-muted-foreground">Gift Cards</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatNumber(stats.totalGiftCard)}
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-white/85 p-4">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
