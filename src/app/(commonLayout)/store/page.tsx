"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  Coins as CoinsIcon,
  Gift as GiftIcon,
  LoaderCircle,
  ShoppingBag,
  Send,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuyGiftDialog } from "@/components/store/buy-gift-dialog";
import { SendGiftDialog } from "@/components/store/send-gift-dialog";

type CoinPackage = {
  id: string;
  coinAmount: string;
  price: number;
};

type GiftCard = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
};

type PurchasedGift = {
  id: string;
  giftCardId: string;
  count: number;
};

const FALLBACK_IMAGE = "/fallback.jpg";

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<"coins" | "gifts">("coins");
  const [giftCategory, setGiftCategory] = useState<string>("ALL");
  const [coins, setCoins] = useState<CoinPackage[]>([]);
  const [gifts, setGifts] = useState<GiftCard[]>([]);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [purchasedGifts, setPurchasedGifts] = useState<PurchasedGift[]>([]);
  const [totalPurchased, setTotalPurchased] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // Gift dialog states
  const [selectedGift, setSelectedGift] = useState<GiftCard | null>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const handleBuyCoin = async (coinId: string) => {
    setPurchasingId(coinId);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId }),
      });
      const data = await res.json();
      if (data?.data?.url) {
        window.location.href = data.data.url;
      } else {
        console.error("No checkout url returned", data);
      }
    } catch (error) {
      console.error("Purchase error:", error);
    } finally {
      setPurchasingId(null);
    }
  };

  const loadUserData = async () => {
    try {
      const [userRes] = await Promise.all([
        fetch("/api/user/me", { cache: "no-store" }),
      ]);
      const userResult = await userRes.json();
      if (userResult?.data?.totalCoins !== undefined) {
        setUserCoins(userResult.data.totalCoins);
      }
    } catch (error) {
      console.error("Load user data error:", error);
    }
  };

  const loadPurchasedGifts = async () => {
    try {
      const res = await fetch("/api/gift/purchases", { cache: "no-store" });
      const result = await res.json();
      if (result?.data?.purchases) {
        let purchases = result.data.purchases;
        
        // If the backend returns grouped categories (an object), flatten it into an array
        if (!Array.isArray(purchases) && typeof purchases === 'object') {
          purchases = Object.values(purchases).flat();
        }
        
        setPurchasedGifts(purchases);
        const total = purchases.reduce((sum: number, p: PurchasedGift) => sum + p.count, 0);
        setTotalPurchased(total);
      }
    } catch (error) {
      console.error("Load purchased gifts error:", error);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadUserData(), loadPurchasedGifts()]);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (activeTab === "coins") {
          const res = await fetch("/api/store/coins", { cache: "no-store" });
          const result = await res.json();
          setCoins(Array.isArray(result?.data) ? result.data : []);
        } else {
          const res = await fetch("/api/store/gift-card", { cache: "no-store" });
          const result = await res.json();
          setGifts(Array.isArray(result?.data) ? result.data : []);
        }

        await refreshAll();
      } catch (error) {
        console.error("Store load error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab]);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const getPurchasedCountForGift = (giftCardId: string) => {
    const gift = purchasedGifts.find((p) => p.giftCardId === giftCardId);
    return gift?.count || 0;
  };

  const handleBuyClick = (gift: GiftCard) => {
    setSelectedGift(gift);
    setShowBuyDialog(true);
  };

  const handleSendClick = (gift: GiftCard) => {
    setSelectedGift(gift);
    setShowSendDialog(true);
  };

  const filteredGifts = giftCategory === "ALL" 
    ? gifts 
    : gifts.filter(g => g.category?.toUpperCase() === giftCategory);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Page Header */}
      <div className="relative flex flex-col mt-5 items-center justify-center space-y-4 pt-4 text-center">
        {userCoins > 0 && (
          <div className="absolute right-0 top-0 flex items-center gap-2 rounded-2xl bg-amber-100 px-5 py-2.5 text-amber-600 shadow-sm border border-amber-200">
            <CoinsIcon className="h-5 w-5" />
            <span className="text-sm font-black uppercase tracking-wider">
              My Coins: <span className="text-lg">{userCoins}</span>
            </span>
          </div>
        )}
        {totalPurchased > 0 && (
          <div className="absolute left-0 top-0 flex items-center gap-2 rounded-2xl bg-green-100 px-5 py-2.5 text-green-600 shadow-sm border border-green-200">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-black uppercase tracking-wider">
              Gifts: <span className="text-lg">{totalPurchased}</span>
            </span>
          </div>
        )}
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Friendzo Store</h1>
        <p className="max-w-2xl text-muted-foreground">
          Elevate your experience by getting coins or sending beautiful gift cards to your friends.
        </p>
      </div>

      {/* Tab Controls */}
      <div className="flex justify-center p-1">
        <div className="inline-flex items-center rounded-2xl bg-white/60 p-1.5 shadow-[0_15px_45px_-15px_rgba(88,70,52,0.15)] backdrop-blur-md border border-white/60">
          <button
            onClick={() => setActiveTab("coins")}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
              activeTab === "coins"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            }`}
          >
            <CoinsIcon className="h-4 w-4" />
            Coins
          </button>
          <button
            onClick={() => setActiveTab("gifts")}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
              activeTab === "gifts"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            }`}
          >
            <GiftIcon className="h-4 w-4" />
            Gift Cards
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-sm">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Fetching data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeTab === "coins" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {coins.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="group relative overflow-hidden rounded-[2.2rem] border border-black/5 bg-white p-8 shadow-[0_15px_45px_-30px_rgba(88,70,52,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgba(88,70,52,0.4)]"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-amber-50 text-amber-500 border border-amber-100 shadow-sm transition-transform group-hover:scale-110">
                      <BadgeDollarSign className="h-10 w-10" />
                    </div>
                    <div className="mt-8 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-foreground">{pkg.coinAmount}</span>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Coins</span>
                      </div>
                      <p className="text-xl font-bold text-primary">${pkg.price.toFixed(2)}</p>
                    </div>
                    <Button
                      onClick={() => handleBuyCoin(pkg.id)}
                      disabled={purchasingId === pkg.id}
                      className="mt-8 h-12 w-full rounded-2xl font-bold shadow-lg shadow-primary/20"
                    >
                      {purchasingId === pkg.id ? "Processing..." : "Get Now"}
                    </Button>
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar for Gift Categories */}
                <div className="w-full md:w-64 shrink-0 space-y-2">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Categories</h3>
                  {["ALL", "ESSENTIAL", "EXCLUSIVE", "MAJESTIC"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGiftCategory(cat)}
                      className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                        giftCategory === cat
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                          : "bg-white/60 text-muted-foreground hover:bg-white hover:text-foreground border border-black/5"
                      }`}
                    >
                      {cat === "ALL" ? "All Gifts" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                {/* Gifts Grid */}
                <div className="flex-1">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredGifts.length === 0 && (
                      <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-primary/20 bg-white/40 p-8 text-center backdrop-blur-sm">
                        <p className="text-lg font-bold text-foreground">No gifts in this category</p>
                      </div>
                    )}
                    {filteredGifts.map((gift) => {
                      const purchasedCount = getPurchasedCountForGift(gift.id);
                      return (
                        <div
                          key={gift.id}
                          className="group relative overflow-hidden rounded-[2.2rem] border border-black/5 bg-white shadow-[0_15px_45px_-30px_rgba(88,70,52,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgba(88,70,52,0.4)]"
                        >
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={(!imageErrors.has(gift.id) && gift.image) ? gift.image : FALLBACK_IMAGE}
                          alt={gift.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={() => handleImageError(gift.id)}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                        <div className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/30">
                          {gift.category}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                          <h3 className="text-xl font-bold tracking-tight">{gift.name}</h3>
                          <p className="mt-1 text-lg font-bold text-primary-foreground/90">{gift.price} coins</p>
                        </div>
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                            {gift.category}
                          </span>
                          {purchasedCount > 0 && (
                            <span className="text-xs font-medium text-muted-foreground">
                              Owned: {purchasedCount}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => handleBuyClick(gift)}
                          className="h-12 w-full rounded-2xl bg-primary font-bold text-white hover:bg-primary/90 transition-all"
                        >
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Buy
                        </Button>
                        <Button
                          onClick={() => handleSendClick(gift)}
                          variant="outline"
                          className="h-12 w-full rounded-2xl font-bold text-primary border-primary/20 hover:bg-primary/5 transition-all"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Gift {purchasedCount > 0 && `(${purchasedCount})`}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              </div>
            )}

            {((activeTab === "coins" && coins.length === 0) || (activeTab === "gifts" && gifts.length === 0)) && (
              <div className="flex h-64 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-primary/20 bg-white/40 p-8 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-foreground">No items available yet</p>
                <p className="text-sm text-muted-foreground">Please check back in a few moments.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <BuyGiftDialog
        gift={selectedGift}
        userCoins={userCoins}
        isOpen={showBuyDialog}
        onClose={() => setShowBuyDialog(false)}
        onSuccess={refreshAll}
      />

      <SendGiftDialog
        gift={selectedGift}
        userCoins={userCoins}
        isOpen={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        onSuccess={refreshAll}
      />
    </div>
  );
}

