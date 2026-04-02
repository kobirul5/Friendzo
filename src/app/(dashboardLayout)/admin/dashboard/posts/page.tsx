import { cookies } from "next/headers";

import AdminPostsManager, {
  type AdminPostItem,
  type AdminPostsMeta,
} from "@/components/shared/admin-posts-manager";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "10";
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

type PostsPageProps = {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
  }>;
};

async function getAdminPosts(options: {
  page: string;
  limit: string;
  sortBy: string;
  sortOrder: string;
  search?: string;
}): Promise<{ posts: AdminPostItem[]; meta: AdminPostsMeta | null }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const params = new URLSearchParams({
    page: options.page,
    limit: options.limit,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
  });

  if (options.search) {
    params.set("search", options.search);
  }

  try {
    const res = await fetch(`${BASE_URL}/posts?${params.toString()}`, {
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
      return { posts: [], meta: null };
    }

    return {
      posts: Array.isArray(result?.data?.data) ? result.data.data : [],
      meta: result?.data?.meta ?? null,
    };
  } catch (error) {
    console.error("Failed to fetch admin posts:", error);
    return { posts: [], meta: null };
  }
}

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const page = resolvedSearchParams.page || DEFAULT_PAGE;
  const limit = resolvedSearchParams.limit || DEFAULT_LIMIT;
  const sortBy = resolvedSearchParams.sortBy || DEFAULT_SORT_BY;
  const sortOrder = resolvedSearchParams.sortOrder || DEFAULT_SORT_ORDER;
  const search = (resolvedSearchParams.search || "").trim();

  const { posts, meta } = await getAdminPosts({
    page,
    limit,
    sortBy,
    sortOrder,
    search,
  });

  return <AdminPostsManager initialPosts={posts} meta={meta} initialSearch={search} />;
}
