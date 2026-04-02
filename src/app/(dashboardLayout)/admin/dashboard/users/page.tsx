import { cookies } from "next/headers";

import AdminUserDirectory, {
  type AdminDirectoryUser,
} from "@/components/shared/admin-user-directory";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "10";
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

type UsersPageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    isDating?: string;
  }>;
};

async function getUsers(options: {
  search: string;
  page: string;
  limit: string;
  sortBy: string;
  sortOrder: string;
  isDating?: string;
}): Promise<AdminDirectoryUser[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const params = new URLSearchParams();

  params.set("page", options.page);
  params.set("limit", options.limit);
  params.set("sortBy", options.sortBy);
  params.set("sortOrder", options.sortOrder);

  if (options.search) {
    params.set("search", options.search);
  }

  if (options.isDating) {
    params.set("isDating", options.isDating);
  }

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
    const result = await res.json();

    if (!res.ok) {
      return [];
    }

    return Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.data?.data)
        ? result.data.data
        : [];
  } catch (error) {
    console.error("Failed to fetch admin users:", error);
    return [];
  }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const search = (resolvedSearchParams.search || "").trim();
  const page = resolvedSearchParams.page || DEFAULT_PAGE;
  const limit = resolvedSearchParams.limit || DEFAULT_LIMIT;
  const sortBy = resolvedSearchParams.sortBy || DEFAULT_SORT_BY;
  const sortOrder = resolvedSearchParams.sortOrder || DEFAULT_SORT_ORDER;
  const isDating = resolvedSearchParams.isDating;
  const users = await getUsers({
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    isDating,
  });

  return (
    <AdminUserDirectory
      users={users}
      title="All Users"
      subtitle="Browse every registered account from the admin dashboard and search by name or email."
      emptyTitle={search ? "No user matched your search" : "No users found"}
      emptyDescription={
        search
          ? "Try a different name or email keyword to find the user you are looking for."
          : "When users are available in the system, they will appear here."
      }
      searchValue={search}
      searchPlaceholder="Search by name or email"
    />
  );
}
