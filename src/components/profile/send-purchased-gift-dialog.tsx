"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Send, CheckCircle2, UserCheck, Package } from "lucide-react";
import { toast } from "sonner";

type GiftCard = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  count: number;
};

type Friend = {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
};

type SendPurchasedGiftDialogProps = {
  gift: GiftCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function SendPurchasedGiftDialog({ gift, isOpen, onClose, onSuccess }: SendPurchasedGiftDialogProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
      setSelectedFriends(new Set());
      setSearchQuery("");
      setSuccess(false);
    }
  }, [isOpen]);

  const loadFriends = async () => {
    try {
      const res = await fetch("/api/network/friends");
      const data = await res.json();
      console.log("Load friends response:", data);
      
      let friendsList = [];
      if (data?.data?.friends) {
        friendsList = data.data.friends;
      } else if (Array.isArray(data?.data)) {
        friendsList = data.data;
      }
      
      console.log("Parsed friends list:", friendsList);
      setFriends(friendsList);
    } catch (error) {
      console.error("Load friends error:", error);
      toast.error("Failed to load friends");
    }
  };

  const toggleFriend = useCallback((friendId: string) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  }, []);

  const handleSend = useCallback(async () => {
    if (!gift) return;
    if (selectedFriends.size === 0) {
      toast.error("Please select at least one friend");
      return;
    }
    if (gift.count < selectedFriends.size) {
      toast.error("Not enough purchased gifts", {
        description: `You only have ${gift.count} of this gift`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/gift/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverIds: Array.from(selectedFriends),
          giftCardId: gift.id,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Gifts sent successfully!");
        onSuccess();
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to send gift");
      }
    } catch (error) {
      console.error("Send gift error:", error);
      toast.error("Failed to send gift");
    } finally {
      setIsLoading(false);
    }
  }, [gift, selectedFriends, onSuccess, onClose]);

  const filteredFriends = friends.filter((friend) => {
    const name = `${friend.firstName} ${friend.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  if (!gift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Send Gift to Friends</DialogTitle>
          <DialogDescription>Select friends to send this gift to</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
            <p className="mt-4 text-lg font-semibold text-green-600">Gifts Sent Successfully!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gift Info */}
            <div className="flex items-center gap-4 rounded-2xl bg-muted/30 p-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                <Image src={gift.image} alt={gift.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{gift.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Owned: {gift.count}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl pl-10"
              />
            </div>

            {/* Friends List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredFriends.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No friends found</p>
              ) : (
                filteredFriends.map((friend) => {
                  const isSelected = selectedFriends.has(friend.id);
                  const name = `${friend.firstName} ${friend.lastName}`;
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-full">
                        {friend.profileImage ? (
                          <Image src={friend.profileImage} alt={name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10">
                            <UserCheck className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <span className="flex-1 text-left font-medium">{name}</span>
                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected Count */}
            {selectedFriends.size > 0 && (
              <div className="rounded-xl bg-primary/5 px-4 py-3">
                <div className="text-center text-sm font-medium text-primary">
                  {selectedFriends.size} friend{selectedFriends.size > 1 ? "s" : ""} selected
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isLoading || selectedFriends.size === 0 || gift.count === 0}
                className="flex-1 rounded-xl bg-primary"
              >
                <Send className="mr-2 h-4 w-4" />
                {isLoading ? "Sending..." : `Send to ${selectedFriends.size} Friend${selectedFriends.size !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
