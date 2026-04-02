import { cookies } from "next/headers";

import AdminUserDirectory, {
  type AdminDirectoryUser,
} from "@/components/shared/admin-user-directory";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "10";
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

async function getBlockedUsers(): Promise<AdminDirectoryUser[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const params = new URLSearchParams({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sortBy: DEFAULT_SORT_BY,
    sortOrder: DEFAULT_SORT_ORDER,
    status: "BLOCKED",
  });

  try {
    const res = await fetch(`${BASE_URL}/dashboard/all-users?${params.toString()}`, {
      headers: accessToken
        ? {
            Authorization: accessToken,
            "Content-Type": "application/json",
          }
        : undefined,
      cache: "no-store",
    });


    if (!res.ok) {
      return [];
    }

    const result = await res.json();
    return Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.data?.data)
        ? result.data.data
        : [];
  } catch (error) {
    console.error("Failed to fetch blocked users:", error);
    return [];
  }
}

export default async function BlockedUsersPage() {
  const users = await getBlockedUsers();

  return (
    <AdminUserDirectory
      users={users}
      title="Blocked Users"
      subtitle="Review every restricted account from the admin dashboard in one place."
      emptyTitle="No blocked users found"
      emptyDescription="Blocked accounts will appear here when users are restricted by the platform."
    />
  );
}
