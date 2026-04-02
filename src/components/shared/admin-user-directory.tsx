"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, Search, ShieldBan, UserRound, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";

export type AdminDirectoryUser = {
  id: string;
  serial?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
  profileImage?: string | null;
  isBlocked?: boolean | null;
  status?: string | null;
  createdAt?: string | null;
};

type AdminUserDirectoryProps = {
  users: AdminDirectoryUser[];
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  searchValue?: string;
  searchPlaceholder?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminUserDirectory({
  users,
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  searchValue = "",
  searchPlaceholder = "Search users",
}: AdminUserDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchValue);
  const [isPending, startTransition] = useTransition();
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [openMenu, setOpenMenu] = useState<{
    userId: string;
    top: number;
    left: number;
    isBlocked: boolean;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const showSearch = pathname === "/admin/dashboard/users";
  const normalizedUsers = useMemo(
    () =>
      users.map((user, index) => ({
        ...user,
        isBlocked: user.isBlocked ?? user.status === "BLOCKED",
        serial: user.serial ?? index + 1,
      })),
    [users]
  );

  useEffect(() => {
    if (!openMenu) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (menuRef.current?.contains(target)) return;
      setOpenMenu(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [openMenu]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusChange = async (userId: string, nextStatus: "ACTIVE" | "BLOCKED") => {
    setActionUserId(userId);
    setFeedback("");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const result = await res.json();

      if (!res.ok || result?.success === false) {
        setFeedback(result?.message || "Failed to update user status.");
        return;
      }

      setFeedback(nextStatus === "BLOCKED" ? "User blocked successfully." : "User unblocked successfully.");
      setOpenMenu(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to update user status:", error);
      setFeedback("Something went wrong while updating user status.");
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            User Directory
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-primary/7 px-4 py-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 text-primary" />
          <span>{normalizedUsers.length} users</span>
        </div>
      </div>

      {showSearch ? (
        <form
          onSubmit={handleSearchSubmit}
          className="rounded-[1.6rem] border border-white/70 bg-white/85 p-4 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.28)]"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-12 rounded-2xl border-primary/10 bg-primary/5 pl-11"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_18px_35px_-25px_rgba(109,87,67,0.55)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      ) : null}

      {feedback ? (
        <div className="rounded-[1.4rem] border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      {normalizedUsers.length > 0 ? (
        <div className="rounded-[1.8rem] border border-black/5 bg-white/92 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.32)]">
          <div className="overflow-x-auto rounded-[1.8rem]">
            <table className="min-w-full">
              <thead className="bg-primary/8">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                  <th className="px-4 py-4">SL</th>
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Created</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {normalizedUsers.map((user) => {
                  const fullName =
                    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Unknown User";
                  const initial = fullName.charAt(0).toUpperCase();
                  const isBlocked = Boolean(user.isBlocked);
                  const isActing = actionUserId === user.id;

                  return (
                    <tr key={user.id} className="align-middle text-sm">
                      <td className="px-4 py-4 font-medium text-foreground">{user.serial}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[linear-gradient(135deg,#ead8c2,#c7a783)]">
                            {user.profileImage ? (
                              <Image
                                src={user.profileImage}
                                alt={fullName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-primary">
                                {initial}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{fullName}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[220px] px-4 py-4 text-muted-foreground">
                        <span className="block truncate">{user.email || "No email found"}</span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{user.role || "USER"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            isBlocked
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/8 text-primary"
                          }`}
                        >
                          {isBlocked ? "Blocked" : user.status || "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={(event) => {
                              const rect = event.currentTarget.getBoundingClientRect();
                              const nextLeft = Math.max(16, rect.right - 176);
                              const nextTop = rect.bottom + 8;

                              setOpenMenu((current) =>
                                current?.userId === user.id
                                  ? null
                                  : {
                                      userId: user.id,
                                      top: nextTop,
                                      left: nextLeft,
                                      isBlocked,
                                    }
                              );
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/6 text-foreground transition hover:bg-primary/12"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-primary/20 bg-white/70 p-6 text-center sm:p-10">
          <p className="text-lg font-semibold text-foreground">{emptyTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      )}

      {openMenu ? (
        <div
          ref={menuRef}
          className="fixed z-[100] w-44 rounded-2xl border border-black/5 bg-white p-2 shadow-xl"
          style={{
            top: openMenu.top,
            left: openMenu.left,
          }}
        >
          <Link
            href={`/admin/dashboard/my-profile?id=${openMenu.userId}`}
            onClick={() => setOpenMenu(null)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-primary/8"
          >
            <UserRound className="h-4 w-4" />
            View profile
          </Link>
          <button
            type="button"
            disabled={actionUserId === openMenu.userId}
            onClick={() =>
              handleStatusChange(openMenu.userId, openMenu.isBlocked ? "ACTIVE" : "BLOCKED")
            }
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${
              openMenu.isBlocked
                ? "text-primary hover:bg-primary/8"
                : "text-destructive hover:bg-destructive/10"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            <ShieldBan className="h-4 w-4" />
            {actionUserId === openMenu.userId
              ? "Updating..."
              : openMenu.isBlocked
                ? "Unblock user"
                : "Block user"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
