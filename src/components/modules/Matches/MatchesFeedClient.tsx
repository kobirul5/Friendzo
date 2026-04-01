"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Users } from "lucide-react";
import { MatchCard } from "./MatchCard";
import { Button } from "@/components/ui/button";

interface MatchUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  dob: string | number;
  address: string;
  interestPercentage: number;
  distanceKm: number;
}

interface MatchesFeedClientProps {
  initialItems: MatchUser[];
  initialTotal: number;
  pageSize: number;
  accessToken?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function MatchesFeedClient({
  initialItems,
  initialTotal,
  pageSize,
  accessToken,
}: MatchesFeedClientProps) {
  const [items, setItems] = useState<MatchUser[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialItems.length < initialTotal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreMatches = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`${BASE_URL}/discoverByInterest/match?page=${nextPage}&limit=${pageSize}`, {
        headers: {
          Authorization: `${accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch more matches");

      const result = await res.json();
      const nextItems = result.data || [];
      const total = result.meta?.total || 0;

      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const filtered = nextItems.filter((i: MatchUser) => !existingIds.has(i.id));
        return [...prev, ...filtered];
      });
      
      setPage(nextPage);
      setHasMore(items.length + nextItems.length < total);
    } catch (error) {
      console.error("Error loading more matches:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!hasMore || isLoadingMore || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreMatches();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, page]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Matches
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            People with similar Interest
          </p>
          <p className="mt-1 text-4xl font-bold text-primary">{initialTotal}</p>
        </div>
        <Button variant="ghost" className="flex items-center gap-2 rounded-full text-primary hover:bg-primary/5 hover:text-primary">
          <span className="text-sm font-semibold">See My circle</span>
          <Users className="h-5 w-5" />
        </Button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {items.map((user) => (
          <MatchCard key={user.id} user={user} />
        ))}
      </div>

      {/* Loading State / Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-10">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <span>Finding more matches...</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Scroll to see more</span>
          )}
        </div>
      )}

      {items.length === 0 && !isLoadingMore && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-primary/10 p-6">
                <Users className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-foreground">No matches found</h2>
            <p className="mt-2 text-muted-foreground">Try updating your interests in your profile.</p>
        </div>
      )}
    </div>
  );
}
