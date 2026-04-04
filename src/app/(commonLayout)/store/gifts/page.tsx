"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { 
  Gift as GiftIcon, 
  LoaderCircle, 
  ShoppingCart, 
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

type GiftCard = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
};

const FALLBACK_IMAGE = "/fallback.jpg";

export default function GiftsStorePage() {
  const [gifts, setGifts] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/store/gift-card", { cache: "no-store" });
        const result = await res.json();
        setGifts(Array.isArray(result?.data) ? result.data : []);
      } catch (error) {
        console.error("Gifts load error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
              Spread the Joy
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Gift <span className="text-primary italic">Cards</span> Galore
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Express yourself and make someone&apos;s day. Select from our majestic collection of 
              gift cards and send them to your favorite people in the Friendzo circle.
            </p>
          </div>

          <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-primary/10 text-primary shadow-inner">
             <GiftIcon className="h-16 w-16" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-100">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-sm">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Loading Gift Cards...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Exquisite Collection</h2>

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
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                    
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

              {gifts.length === 0 && (
                <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-primary/20 bg-white/40 p-8 text-center backdrop-blur-sm">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GiftIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">No gift cards found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Select something else or check back again shortly.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
