"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { InterestBadge } from "@/components/profile/interest-badge";

type InterestGridItem = {
  id?: string;
  name: string;
  image?: string | null;
};

type InterestGridProps = {
  interests: InterestGridItem[];
  emptyMessage: string;
  initialCount?: number;
  selectedNames?: string[];
  onToggle?: (interestName: string) => void;
  gridClassName?: string;
};

export function InterestGrid({
  interests,
  emptyMessage,
  initialCount = 6,
  selectedNames = [],
  onToggle,
  gridClassName,
}: InterestGridProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleInterests = showAll ? interests : interests.slice(0, initialCount);
  const hasMore = interests.length > initialCount;

  if (interests.length === 0) {
    return <p className="text-sm italic text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      <div className={gridClassName || "grid grid-cols-2 gap-3 sm:grid-cols-3"}>
        {visibleInterests.map((interest) => (
          <InterestBadge
            key={interest.id || interest.name}
            name={interest.name}
            image={interest.image || undefined}
            selected={selectedNames.includes(interest.name)}
            onClick={onToggle ? () => onToggle(interest.name) : undefined}
          />
        ))}
      </div>

      {hasMore ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowAll((current) => !current)}
          className="h-auto rounded-full px-0 text-sm font-semibold text-primary hover:bg-transparent hover:text-primary/80"
        >
          {showAll ? "Show less" : "View all"}
        </Button>
      ) : null}
    </div>
  );
}
