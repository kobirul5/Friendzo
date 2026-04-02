"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Trash2, View } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import AdminPostDetailSheet from "@/components/shared/admin-post-detail-sheet";
import { Input } from "@/components/ui/input";

export type AdminPostItem = {
  id: string;
  image: string;
  description: string;
  address?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profileImage?: string | null;
  } | null;
  MemoryLike?: Array<{
    id: string;
    user?: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      profileImage?: string | null;
    } | null;
  }>;
  Comment?: Array<{
    id: string;
    content?: string;
    user?: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      profileImage?: string | null;
    } | null;
  }>;
};

export type AdminPostsMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

type AdminPostsManagerProps = {
  initialPosts: AdminPostItem[];
  meta?: AdminPostsMeta | null;
  initialSearch?: string;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export default function AdminPostsManager({
  initialPosts,
  meta,
  initialSearch = "",
}: AdminPostsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [activePost, setActivePost] = useState<AdminPostItem | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "likes" | "comments">("overview");
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const posts = useMemo(() => initialPosts, [initialPosts]);
  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const totalRecords = meta?.total ?? posts.length;
  const limit = meta?.limit ?? 10;

  const updateRouteParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateRouteParams({
      search: search.trim() || null,
      page: "1",
    });
  };

  const handleLimitChange = (value: string) => {
    updateRouteParams({
      limit: value,
      page: "1",
    });
  };

  const handleDelete = async (postId: string) => {
    setDeletingId(postId);

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || result?.success === false) {
        toast.error(result?.message || "Failed to delete post.");
        return;
      }

      toast.success("Post deleted successfully.");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Something went wrong while deleting the post.");
    } finally {
      setDeletingId(null);
    }
  };

  const requestDeleteConfirmation = (postId: string) => {
    toast("Delete this post?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => {
          void handleDelete(postId);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      duration: 10000,
    });
  };

  const handleViewPost = async (postId: string) => {
    setIsDetailLoading(true);
    setDetailTab("overview");

    try {
      const res = await fetch(`/api/admin/posts/${postId}`);
      const result = await res.json();

      if (!res.ok || result?.success === false) {
        toast.error(result?.message || "Failed to load post details.");
        return;
      }

      setActivePost(result?.data ?? null);
    } catch (error) {
      console.error("Failed to load post detail:", error);
      toast.error("Something went wrong while loading post details.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Hello, Jhon Son!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Post Management</p>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search User"
            className="h-12 rounded-full border-primary/10 bg-white pr-12"
          />
        </div>
      </form>

      <div className="overflow-hidden rounded-[1.4rem] border border-[#ead5ef] bg-white shadow-[0_18px_40px_-35px_rgba(95,76,55,0.28)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#eddcf1]">
              <tr className="text-left text-xs font-semibold text-foreground/70">
                <th className="px-5 py-4">User</th>
                <th className="px-4 py-4">Photo</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Upload Time</th>
                <th className="px-4 py-4">Like</th>
                <th className="px-4 py-4">Comment</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {posts.map((post) => {
                const userName =
                  [post.user?.firstName, post.user?.lastName].filter(Boolean).join(" ").trim() ||
                  "Unknown User";
                const userMeta = post.user?.email ? `#${post.user.email.split("@")[0]}` : `#${post.id.slice(0, 6)}`;
                const previewStatus = post.description || post.address || "No description";
                const likes = post.MemoryLike?.length ?? 0;
                const comments = post.Comment?.length ?? 0;
                const isDeleting = deletingId === post.id;

                return (
                  <tr key={post.id} className="text-sm">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-foreground">{userName}</p>
                        <p className="text-xs text-muted-foreground">{userMeta}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border border-black/5">
                        <Image src={post.image} alt={post.description} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="max-w-[160px] px-4 py-4 text-foreground/80">
                      <p className="line-clamp-2">{previewStatus}</p>
                    </td>
                    <td className="px-4 py-4 text-foreground/80">{formatTime(post.createdAt)}</td>
                    <td className="px-4 py-4 text-foreground/80">{likes}</td>
                    <td className="px-4 py-4 text-foreground/80">{comments}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewPost(post.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/8 text-primary transition hover:bg-primary/14"
                          title="View Post"
                          aria-label="View Post"
                        >
                          <View className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => requestDeleteConfirmation(post.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive transition hover:bg-destructive/15 disabled:opacity-70"
                          title={isDeleting ? "Deleting..." : "Delete Post"}
                          aria-label="Delete Post"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <div className="flex flex-col gap-4 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span>Showing</span>
          <select
            value={String(limit)}
            onChange={(event) => handleLimitChange(event.target.value)}
            className="h-10 rounded-xl border border-primary/10 bg-white px-3 text-foreground outline-none"
          >
            {[10, 20, 30, 50].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <p>
          Showing {(currentPage - 1) * limit + (posts.length ? 1 : 0)} to {(currentPage - 1) * limit + posts.length} out of {totalRecords} records
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1 || isPending}
            onClick={() => updateRouteParams({ page: String(currentPage - 1) })}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/10 text-foreground disabled:opacity-40"
          >
            {"<"}
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .slice(Math.max(0, currentPage - 2), Math.max(4, currentPage + 1))
            .map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => updateRouteParams({ page: String(pageNumber) })}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                  currentPage === pageNumber
                    ? "border border-[#c311d6] text-[#c311d6]"
                    : "text-foreground/70"
                }`}
              >
                {pageNumber}
              </button>
            ))}
          <button
            type="button"
            disabled={currentPage >= totalPages || isPending}
            onClick={() => updateRouteParams({ page: String(currentPage + 1) })}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/10 text-foreground disabled:opacity-40"
          >
            {">"}
          </button>
        </div>
      </div>

      <AdminPostDetailSheet
        post={activePost}
        open={Boolean(activePost)}
        isLoading={isDetailLoading}
        detailTab={detailTab}
        onOpenChange={(open) => {
          if (!open) {
            setActivePost(null);
          }
        }}
        onDetailTabChange={setDetailTab}
      />
    </div>
  );
}
