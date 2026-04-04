"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { 
  BadgeDollarSign, 
  ChevronRight, 
  Coins as CoinsIcon, 
  Gift as GiftIcon, 
  LoaderCircle, 
  ShoppingCart, 
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const FALLBACK_IMAGE = "/fallback.jpg";

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<"coins" | "gifts">("coins");
  const [coins, setCoins] = useState<CoinPackage[]>([]);
  const [gifts, setGifts] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-[0_25px_70px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md sm:p-12">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(198,167,131,0.25),transparent_60%),radial-gradient(circle_at_top_right,rgba(240,220,190,0.5),transparent_50%)]" />
        
        <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              Friendzo Premium Store
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Elevate Your <span className="text-primary italic">Experience</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Get coins to unlock special features or send stunning gift cards to your favorite profiles. 
              Discover the joy of giving today.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
            <button
              onClick={() => setActiveTab("coins")}
              className={`group flex flex-1 items-center gap-4 rounded-3xl border p-5 transition-all sm:min-w-[200px] ${
                activeTab === "coins"
                  ? "border-primary/30 bg-primary/8 shadow-[0_20px_40px_-15px_rgba(190,156,121,0.4)]"
                  : "border-white/50 bg-white/40 hover:bg-white/60"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-colors ${
                activeTab === "coins" ? "bg-primary text-white" : "bg-primary/10 text-primary"
              }`}>
                <CoinsIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">Coin Bundles</p>
                <p className="text-xs text-muted-foreground">Power up account</p>
              </div>
              <ChevronRight className={`ms-auto h-5 w-5 transition-transform ${activeTab === "coins" ? "translate-x-1 opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
            </button>

            <button
              onClick={() => setActiveTab("gifts")}
              className={`group flex flex-1 items-center gap-4 rounded-3xl border p-5 transition-all sm:min-w-[200px] ${
                activeTab === "gifts"
                  ? "border-primary/30 bg-primary/8 shadow-[0_20px_40px_-15px_rgba(190,156,121,0.4)]"
                  : "border-white/50 bg-white/40 hover:bg-white/60"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-colors ${
                activeTab === "gifts" ? "bg-primary text-white" : "bg-primary/10 text-primary"
              }`}>
                <GiftIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">Gift Cards</p>
                <p className="text-xs text-muted-foreground">Impress friends</p>
              </div>
              <ChevronRight className={`ms-auto h-5 w-5 transition-transform ${activeTab === "gifts" ? "translate-x-1 opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-sm">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Loading Store Content...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {activeTab === "coins" ? "Available Coin Bundles" : "Exquisite Gift Cards"}
              </h2>
              {activeTab === "coins" && coins.length > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-amber-600 border border-amber-200">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Prices may vary</span>
                </div>
              )}
            </div>

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

                    <Button className="mt-8 h-12 w-full rounded-2xl font-bold shadow-lg shadow-primary/20">
                      Get Now
                    </Button>
                    
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-colors group-hover:bg-primary/10" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gifts.map((gift) => (
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                      
                      <div className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/30">
                        {gift.category}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <h3 className="text-xl font-bold tracking-tight">{gift.name}</h3>
                        <p className="mt-1 text-lg font-bold text-primary-foreground/90">${gift.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="p-4">
                       <Button variant="ghost" className="h-12 w-full rounded-2xl bg-primary/5 font-bold text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Send as Gift
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {((activeTab === "coins" && coins.length === 0) || (activeTab === "gifts" && gifts.length === 0)) && (
              <div className="flex h-64 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-primary/20 bg-white/40 p-8 text-center backdrop-blur-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {activeTab === "coins" ? <CoinsIcon className="h-8 w-8" /> : <GiftIcon className="h-8 w-8" />}
                </div>
                <h3 className="text-xl font-bold text-foreground">No {activeTab} available right now</h3>
                <p className="mt-2 text-sm text-muted-foreground">Check back later for fresh updates in the store.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
