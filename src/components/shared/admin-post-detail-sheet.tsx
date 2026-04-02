"use client";

import Image from "next/image";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { AdminPostItem } from "@/components/shared/admin-posts-manager";

type AdminPostDetailSheetProps = {
  post: AdminPostItem | null;
  open: boolean;
  isLoading: boolean;
  detailTab: "overview" | "likes" | "comments";
  onOpenChange: (open: boolean) => void;
  onDetailTabChange: (tab: "overview" | "likes" | "comments") => void;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export default function AdminPostDetailSheet({
  post,
  open,
  isLoading,
  detailTab,
  onOpenChange,
  onDetailTabChange,
}: AdminPostDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Post Details</SheetTitle>
          <SheetDescription>Review the selected memory post from the admin panel.</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="px-1 py-10 text-center text-sm text-muted-foreground sm:px-4">
            Loading post details...
          </div>
        ) : post ? (
          <div className="space-y-5 px-1 py-4 sm:px-4">
            <div className="relative aspect-[0.95] overflow-hidden rounded-[1.6rem] border border-black/5">
              <Image src={post.image} alt={post.description} fill className="object-cover" />
            </div>
            <div className="rounded-[1.4rem] border border-black/5 bg-white p-4">
              <p className="text-sm font-semibold text-foreground">
                {[post.user?.firstName, post.user?.lastName].filter(Boolean).join(" ").trim() || "Unknown User"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{post.description}</p>
              {post.address ? (
                <p className="mt-3 text-xs text-muted-foreground">Location: {post.address}</p>
              ) : null}
              <div className="mt-4 flex items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => onDetailTabChange("likes")}
                  className={`rounded-full px-3 py-1.5 transition ${
                    detailTab === "likes" ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {post.MemoryLike?.length ?? 0} likes
                </button>
                <button
                  type="button"
                  onClick={() => onDetailTabChange("comments")}
                  className={`rounded-full px-3 py-1.5 transition ${
                    detailTab === "comments" ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {post.Comment?.length ?? 0} comments
                </button>
                <button
                  type="button"
                  onClick={() => onDetailTabChange("overview")}
                  className={`rounded-full px-3 py-1.5 transition ${
                    detailTab === "overview" ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  Overview
                </button>
              </div>
              <div className="mt-4 flex items-center gap-5 text-sm text-muted-foreground">
                <span>{formatTime(post.createdAt)}</span>
              </div>
            </div>

            {detailTab === "likes" ? (
              <div className="rounded-[1.4rem] border border-black/5 bg-white p-4">
                <h3 className="text-sm font-semibold text-foreground">People who liked this post</h3>
                <div className="mt-4 space-y-3">
                  {post.MemoryLike && post.MemoryLike.length > 0 ? (
                    post.MemoryLike.map((like) => {
                      const name =
                        [like.user?.firstName, like.user?.lastName].filter(Boolean).join(" ").trim() ||
                        "Unknown User";

                      return (
                        <div key={like.id} className="flex items-center gap-3 rounded-xl border border-black/5 px-3 py-2">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-primary/8">
                            {like.user?.profileImage ? (
                              <Image src={like.user.profileImage} alt={name} fill className="object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {like.user?.email || "No email found"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No likes yet.</p>
                  )}
                </div>
              </div>
            ) : null}

            {detailTab === "comments" ? (
              <div className="rounded-[1.4rem] border border-black/5 bg-white p-4">
                <h3 className="text-sm font-semibold text-foreground">Comments on this post</h3>
                <div className="mt-4 space-y-3">
                  {post.Comment && post.Comment.length > 0 ? (
                    post.Comment.map((comment) => {
                      const name =
                        [comment.user?.firstName, comment.user?.lastName].filter(Boolean).join(" ").trim() ||
                        "Unknown User";

                      return (
                        <div key={comment.id} className="rounded-xl border border-black/5 px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-primary/8">
                              {comment.user?.profileImage ? (
                                <Image src={comment.user.profileImage} alt={name} fill className="object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {comment.user?.email || "No email found"}
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {comment.content || "No comment content"}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
