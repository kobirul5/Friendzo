import { cookies } from "next/headers";

import AdminUserDirectory, {
  type AdminDirectoryMeta,
  type AdminDirectoryUser,
} from "@/components/shared/admin-user-directory";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "10";
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

type UnblockedUsersPageProps = {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

async function getUnblockedUsers(options: {
  page: string;
  limit: string;
  sortBy: string;
  sortOrder: string;
}): Promise<{ users: AdminDirectoryUser[]; meta: AdminDirectoryMeta | null }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const params = new URLSearchParams({
    page: options.page,
    limit: options.limit,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    status: "ACTIVE",
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
      return { users: [], meta: null };
    }

    const result = await res.json();
    return {
      users: Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.data)
          ? result.data.data
          : [],
      meta: result?.data?.meta ?? null,
    };
  } catch (error) {
    console.error("Failed to fetch unblocked users:", error);
    return { users: [], meta: null };
  }
}

export default async function UnblockedUsersPage({ searchParams }: UnblockedUsersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const page = resolvedSearchParams.page || DEFAULT_PAGE;
  const limit = resolvedSearchParams.limit || DEFAULT_LIMIT;
  const sortBy = resolvedSearchParams.sortBy || DEFAULT_SORT_BY;
  const sortOrder = resolvedSearchParams.sortOrder || DEFAULT_SORT_ORDER;
  const { users, meta } = await getUnblockedUsers({
    page,
    limit,
    sortBy,
    sortOrder,
  });

  return (
    <AdminUserDirectory
      users={users}
      meta={meta}
      title="Unblocked Users"
      subtitle="Review users who are currently active and not blocked."
      emptyTitle="No unblocked users found"
      emptyDescription="Users with active status will appear here."
    />
  );
}
