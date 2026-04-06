"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, ShoppingBag, Coins, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type GiftCard = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
};

type BuyGiftDialogProps = {
  gift: GiftCard | null;
  userCoins: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function BuyGiftDialog({ gift, userCoins, isOpen, onClose, onSuccess }: BuyGiftDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBuy = useCallback(async () => {
    if (!gift) return;
    if (userCoins < gift.price) {
      alert("Not enough coins! Please purchase more coins first.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/gift/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftCardId: gift.id, giftCategory: gift.category }),
      });

      if (res.ok) {
        setSuccess(true);
        onSuccess();
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to purchase gift");
      }
    } catch (error) {
      console.error("Buy gift error:", error);
      alert("Failed to purchase gift");
    } finally {
      setIsLoading(false);
    }
  }, [gift, userCoins, onSuccess, onClose]);

  if (!gift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Purchase Gift Card</DialogTitle>
          <DialogDescription>Buy this gift card to add to your collection</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
            <p className="mt-4 text-lg font-semibold text-green-600">Successfully Purchased!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl bg-muted/30 p-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                <Image src={gift.image} alt={gift.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{gift.name}</h3>
                <p className="text-sm text-muted-foreground">{gift.category}</p>
              </div>
              <p className="text-xl font-bold text-primary">{gift.price} coins</p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3">
              <Coins className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Your Balance: {userCoins} coins</span>
            </div>

            {userCoins < gift.price && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                Not enough coins. You need {gift.price - userCoins} more coins.
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl" disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleBuy} disabled={isLoading || userCoins < gift.price} className="flex-1 rounded-xl bg-primary">
                <ShoppingBag className="mr-2 h-4 w-4" />
                {isLoading ? "Processing..." : "Buy Now"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
