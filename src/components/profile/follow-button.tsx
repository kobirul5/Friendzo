"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, X } from "lucide-react";

type FollowStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | "NOTFOLLOW";

type FollowButtonProps = {
  targetUserId: string;
  initialFollowStatus: FollowStatus;
  initialUserRequestStatus: FollowStatus;
  isProfileComplete: boolean;
};

export function FollowButton({
  targetUserId,
  initialFollowStatus,
  initialUserRequestStatus,
  isProfileComplete,
}: FollowButtonProps) {
  const [followStatus, setFollowStatus] = useState<FollowStatus>(initialFollowStatus);
  const [userRequestStatus, setUserRequestStatus] = useState<FollowStatus>(initialUserRequestStatus);
  const [isLoading, setIsLoading] = useState(false);

  const isFriend = followStatus === "ACCEPTED" || userRequestStatus === "ACCEPTED";
  const hasPendingRequest = followStatus === "PENDING"; // I sent a request to them
  const isRequestReceived = userRequestStatus === "PENDING"; // They sent a request to me

  const handleFollowAction = useCallback(async () => {
    if (!isProfileComplete) {
      window.location.href = "/complete-profile";
      return;
    }

    setIsLoading(true);

    try {
      // If friends, unfriend
      if (isFriend) {
        const res = await fetch("/api/friends/unfriend", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendId: targetUserId }),
        });

        if (res.ok) {
          setFollowStatus("NOTFOLLOW");
          setUserRequestStatus("NOTFOLLOW");
        }
      }
      // If someone sent me a request, accept it (priority over canceling my own request)
      else if (isRequestReceived) {
        const res = await fetch("/api/follow/accept", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: targetUserId }),
        });

        if (res.ok) {
          setFollowStatus("ACCEPTED");
          setUserRequestStatus("NOTFOLLOW");
        }
      }
      // If I sent a request, cancel it
      else if (hasPendingRequest) {
        const res = await fetch("/api/follow/cancel", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: targetUserId }),
        });

        if (res.ok) {
          setFollowStatus("NOTFOLLOW");
          setUserRequestStatus("NOTFOLLOW");
        }
      }
      // Send a new follow request
      else {
        const res = await fetch("/api/follow/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: targetUserId }),
        });

        if (res.ok) {
          const data = await res.json();
          setFollowStatus(data?.data?.requestStatus || "PENDING");
        }
      }
    } catch (error) {
      console.error("Follow action error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    isFriend,
    hasPendingRequest,
    isRequestReceived,
    isProfileComplete,
    targetUserId,
  ]);

  const handleRejectRequest = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/follow/reject", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (res.ok) {
        setUserRequestStatus("NOTFOLLOW");
      }
    } catch (error) {
      console.error("Reject request error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  // Button rendering based on state

  // If we are friends — no button
  if (isFriend) {
    return null;
  }

  // If they sent me a request — show Accept/Reject (checked BEFORE my own pending)
  if (isRequestReceived) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleFollowAction}
          disabled={isLoading}
          className="rounded-xl bg-green-500 px-6 font-semibold text-white hover:bg-green-600"
        >
          <Check className="mr-2 h-4 w-4" />
          {isLoading ? "Accepting..." : "Accept"}
        </Button>
        <Button
          onClick={handleRejectRequest}
          disabled={isLoading}
          variant="outline"
          className="rounded-xl px-4 font-semibold"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // If I sent a request — show Cancel Request
  if (hasPendingRequest) {
    return (
      <Button
        onClick={handleFollowAction}
        disabled={isLoading}
        className="rounded-xl bg-primary px-2 font-semibold text-white hover:bg-primary/90"
      >
        {isLoading ? "Canceling..." : "Cancel Request"}
      </Button>
    );
  }

  // Default: Send follow request
  return (
    <Button
      onClick={handleFollowAction}
      disabled={isLoading}
      className="rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary/90"
    >
      <UserPlus className="mr-2 h-4 w-4" />
      {isLoading ? "Sending..." : "Follow"}
    </Button>
  );
}
