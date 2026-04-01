/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useTransition } from "react";
import {
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createMemoryComment,
  deleteMemoryComment,
  getMemoryComments,
  type MemoryComment,
} from "@/services/memory-comment";
import { getMemoryLikeStats, likeMemory, unlikeMemory } from "@/services/memory-like";

type FeedUser = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
};

export type MemoryFeedItem = {
  id: string;
  image?: string | null;
  description?: string | null;
  address?: string | null;
  createdAt: string;
  totalLikes?: number;
  totalComments?: number;
  isLiked?: boolean;
  user?: FeedUser;
};

type LikeUser = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

function getUserName(user?: FeedUser | LikeUser) {
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return name || user?.email || "Friendzo user";
}

function formatDate(value?: string) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white/75 px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">No memories yet</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        When people start sharing memories, they will appear here.
      </p>
    </div>
  );
}

function LikesModal({
  open,
  onClose,
  likes,
  likeCount,
  title,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  likes: LikeUser[];
  likeCount: number;
  title: string;
  isLoading: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
      <div className="w-full max-w-md rounded-[2rem] border border-white/50 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
              Memory likes
            </p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{likeCount} people liked this post.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Loading likes...
            </div>
          ) : likes.length > 0 ? (
            likes.map((user) => {
              const name = getUserName(user);
              const initials = name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("");

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials || "F"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{user.email || "Friendzo member"}</p>
                    </div>
                  </div>
                  <Heart className="h-4 w-4 fill-primary text-primary" />
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No likes yet for this memory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeedCard({
  item,
  onToggleLike,
  onViewLikes,
  onViewComments,
  isPending,
}: {
  item: MemoryFeedItem;
  onToggleLike: (memoryId: string, isLiked: boolean) => void;
  onViewLikes: (item: MemoryFeedItem) => void;
  onViewComments: (item: MemoryFeedItem) => void;
  isPending: boolean;
}) {
  const userName = getUserName(item.user);
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_24px_80px_-42px_rgba(88,70,52,0.45)]">
      <div className="relative bg-[linear-gradient(160deg,rgba(92,78,63,0.08),rgba(232,220,209,0.55))]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.description || "Memory cover"}
            className="block max-h-[75vh] w-full object-cover"
          />
        ) : (
          <div className="min-h-[360px] w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-white/10" />

        <div className="absolute inset-0 flex flex-col justify-between p-7">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full bg-white/18 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
              {formatDate(item.createdAt)}
            </span>
            <span className="rounded-full border border-white/25 bg-white/18 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-white backdrop-blur-md">
              Memories
            </span>
          </div>

          <div className="space-y-5">
            <div className="max-w-xl">
              <p className="text-2xl font-semibold leading-tight text-white md:text-[1.9rem]">
                {item.description || "A new memory was shared on Friendzo."}
              </p>
              {item.address ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span>{item.address}</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center gap-3">
                {item.user?.profileImage ? (
                  <img
                    src={item.user.profileImage}
                    alt={userName}
                    className="h-12 w-12 rounded-full border-2 border-white/60 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 text-sm font-semibold text-white">
                    {initials || "F"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{userName}</p>
                  <p className="text-xs text-white/75">Shared with the community</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleLike(item.id, !!item.isLiked)}
                  disabled={isPending}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium backdrop-blur-md transition ${
                    item.isLiked
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  {isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className={`h-4 w-4 ${item.isLiked ? "fill-current" : ""}`} />
                  )}
                  {item.isLiked ? "Unlike" : "Like"}
                </button>

                <button
                  type="button"
                  onClick={() => onViewLikes(item)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm text-white backdrop-blur-md transition hover:bg-white/25"
                >
                  <Heart className="h-4 w-4" />
                  {item.totalLikes ?? 0} likes
                </button>

                <button
                  type="button"
                  onClick={() => onViewComments(item)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm text-white backdrop-blur-md transition hover:bg-white/25"
                >
                  <MessageCircle className="h-4 w-4" />
                  {item.totalComments ?? 0} comments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MemoriesFeedClient({
  initialItems,
  currentUserId,
}: {
  initialItems: MemoryFeedItem[];
  currentUserId?: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<MemoryFeedItem | null>(null);
  const [likedUsers, setLikedUsers] = useState<LikeUser[]>([]);
  const [isLikesLoading, setIsLikesLoading] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [comments, setComments] = useState<MemoryComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentSubmitting, startCommentTransition] = useTransition();
  const [commentMessage, setCommentMessage] = useState("");

  const handleToggleLike = (memoryId: string, isLiked: boolean) => {
    startTransition(async () => {
      const action = isLiked ? unlikeMemory : likeMemory;
      const result = await action(memoryId);

      if (!result?.success) {
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === memoryId
            ? {
                ...item,
                isLiked: !isLiked,
                totalLikes: Math.max(0, (item.totalLikes || 0) + (isLiked ? -1 : 1)),
              }
            : item
        )
      );

      if (selectedMemory?.id === memoryId) {
        const updatedLikeCount = Math.max(
          0,
          (selectedMemory.totalLikes || 0) + (isLiked ? -1 : 1)
        );
        setSelectedMemory({
          ...selectedMemory,
          isLiked: !isLiked,
          totalLikes: updatedLikeCount,
        });
      }
    });
  };

  const handleViewLikes = async (item: MemoryFeedItem) => {
    setSelectedMemory(item);
    setLikesModalOpen(true);
    setIsLikesLoading(true);

    const result = await getMemoryLikeStats(item.id);

    if (result.success) {
      setLikedUsers(result.likedBy || []);
      setSelectedMemory({
        ...item,
        totalLikes: result.likeCount ?? item.totalLikes ?? 0,
      });
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, totalLikes: result.likeCount ?? currentItem.totalLikes ?? 0 }
            : currentItem
        )
      );
    } else {
      setLikedUsers([]);
    }

    setIsLikesLoading(false);
  };

  const handleViewComments = async (item: MemoryFeedItem) => {
    setSelectedMemory(item);
    setCommentsModalOpen(true);
    setIsCommentsLoading(true);
    setCommentMessage("");

    const result = await getMemoryComments(item.id);

    if (result.success) {
      setComments(result.comments || []);
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, totalComments: result.comments?.length ?? currentItem.totalComments ?? 0 }
            : currentItem
        )
      );
      setSelectedMemory({
        ...item,
        totalComments: result.comments?.length ?? item.totalComments ?? 0,
      });
    } else {
      setComments([]);
      setCommentMessage(result.message || "Failed to load comments.");
    }

    setIsCommentsLoading(false);
  };

  const handleAddComment = () => {
    if (!selectedMemory || !commentText.trim()) {
      return;
    }

    startCommentTransition(async () => {
      const result = await createMemoryComment(selectedMemory.id, commentText.trim());

      if (!result?.success) {
        setCommentMessage(result?.message || "Failed to add comment.");
        return;
      }

      const refreshed = await getMemoryComments(selectedMemory.id);
      if (refreshed.success) {
        const nextComments = refreshed.comments || [];
        setComments(nextComments);
        setCommentText("");
        setCommentMessage("");
        setSelectedMemory({
          ...selectedMemory,
          totalComments: nextComments.length,
        });
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === selectedMemory.id
              ? { ...item, totalComments: nextComments.length }
              : item
          )
        );
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!selectedMemory) {
      return;
    }

    startCommentTransition(async () => {
      const result = await deleteMemoryComment(commentId);

      if (!result?.success) {
        setCommentMessage(result?.message || "Failed to delete comment.");
        return;
      }

      const nextComments = comments.filter((comment) => comment.id !== commentId);
      setComments(nextComments);
      setCommentMessage("");
      setSelectedMemory({
        ...selectedMemory,
        totalComments: nextComments.length,
      });
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === selectedMemory.id
            ? { ...item, totalComments: nextComments.length }
            : item
        )
      );
    });
  };

  return (
    <>
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_70px_-46px_rgba(88,70,52,0.5)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
                Community feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Memories</h2>
            </div>
            <div className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              {items.length} posts
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            All community memories with image, author, likes and comments.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="space-y-6">
            {items.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                onToggleLike={handleToggleLike}
                onViewLikes={handleViewLikes}
                onViewComments={handleViewComments}
                isPending={isPending}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      <LikesModal
        open={likesModalOpen}
        onClose={() => setLikesModalOpen(false)}
        likes={likedUsers}
        likeCount={selectedMemory?.totalLikes ?? 0}
        title={selectedMemory?.description || "Memory likes"}
        isLoading={isLikesLoading}
      />

      {commentsModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/50 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
                  Memory comments
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  {selectedMemory?.description || "Comments"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedMemory?.totalComments ?? comments.length} comments on this post.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCommentsModalOpen(false)}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 flex gap-3">
              <Input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write a comment..."
                className="h-11 rounded-full"
                disabled={isCommentSubmitting}
              />
              <Button
                type="button"
                onClick={handleAddComment}
                disabled={isCommentSubmitting || !commentText.trim()}
                className="h-11 rounded-full px-5"
              >
                {isCommentSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Comment
              </Button>
            </div>

            {commentMessage ? (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {commentMessage}
              </div>
            ) : null}

            <div className="mt-6 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
              {isCommentsLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Loading comments...
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => {
                  const name = getUserName(comment.user);
                  const initials = name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("");

                  return (
                    <div
                      key={comment.id}
                      className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {comment.user?.profileImage ? (
                            <img
                              src={comment.user.profileImage}
                              alt={name}
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {initials || "F"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-foreground">{name}</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                      {comment.createdAt ? (
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </p>
                          {currentUserId && comment.userId === currentUserId ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="rounded-full"
                              disabled={isCommentSubmitting}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No comments yet for this memory.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
