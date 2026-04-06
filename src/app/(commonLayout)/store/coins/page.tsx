"use client";

import { useEffect, useState } from "react";
import { 
  BadgeDollarSign, 
  ChevronRight, 
  Coins as CoinsIcon, 
  LoaderCircle, 
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CoinPackage = {
  id: string;
  coinAmount: string;
  price: number;
};

export default function CoinsStorePage() {
  const [coins, setCoins] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handleBuyCoin = async (coinId: string) => {
    setPurchasingId(coinId);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/store/coins", { cache: "no-store" });
        const result = await res.json();
        setCoins(Array.isArray(result?.data) ? result.data : []);
      } catch (error) {
        console.error("Coins load error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-[0_25px_70px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md sm:p-12">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(198,167,131,0.25),transparent_60%),radial-gradient(circle_at_top_right,rgba(240,220,190,0.5),transparent_50%)]" />
        
        <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              Power Up Your Account
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Get Friendzo <span className="text-primary italic">Coins</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Unlock exclusive matches, boost your profile visibility, or tip your favorite creators. 
              Extra coins mean extra fun in the circle.
            </p>
          </div>

          <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-primary/10 text-primary shadow-inner">
             <CoinsIcon className="h-16 w-16" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-sm">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Loading Coin Bundles...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Available Bundles</h2>
              <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-amber-600 border border-amber-200">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Prices may vary</span>
              </div>
            </div>

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
                    {purchasingId === pkg.id ? "Processing..." : "Buy Package"}
                  </Button>
                  
                  <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-colors group-hover:bg-primary/10" />
                </div>
              ))}

              {coins.length === 0 && (
                <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-primary/20 bg-white/40 p-8 text-center backdrop-blur-sm">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CoinsIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">No coin bundles found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Please check back soon for fresh coin offers.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
