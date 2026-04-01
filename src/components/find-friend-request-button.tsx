"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type FindFriendRequestButtonProps = {
  userId: string;
};

export function FindFriendRequestButton({ userId }: FindFriendRequestButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendRequest = async () => {
    if (isSubmitting || isRequested) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/follow/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ followerId: userId }),
      });

      const result = await res.json();

      if (res.ok && result?.success) {
        setIsRequested(true);
        setMessage(result?.message || "Request sent successfully.");
        return;
      }

      if (res.status === 409) {
        setIsRequested(true);
      }

      setMessage(result?.message || "Unable to send request right now.");
    } catch (error) {
      console.error("Failed to send friend request:", error);
      setMessage("Unable to send request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-5">
      <Button
        type="button"
        size="sm"
        className="rounded-full px-4"
        disabled={isSubmitting || isRequested}
        onClick={handleSendRequest}
      >
        {isSubmitting ? "Sending..." : isRequested ? "Requested" : "Send Request"}
      </Button>

      {message ? <p className="mt-2 text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
