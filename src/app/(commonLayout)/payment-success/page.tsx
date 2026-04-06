"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);

  // Simulate verification delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, sessionId ? 1500 : 0);
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
        <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
        <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Verifying Payment...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[3rem] border border-white/60 bg-white/80 p-8 shadow-[0_35px_80px_-40px_rgba(88,70,52,0.4)] backdrop-blur-xl sm:p-16 text-center">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(var(--primary),0.05),transparent_50%)]" />
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-green-500/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-green-50 shadow-[0_0_50px_rgba(34,197,94,0.3)] border-8 border-green-100">
            <CheckCircle className="h-16 w-16 text-green-500 shadow-inner" />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-green-700">
            <Sparkles className="h-4 w-4" />
            Payment Successful
          </div>

          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            You&apos;re All Set!
          </h1>
          
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Your transaction has been processed successfully. Your coins have been added to your account and are ready to be used. Thank you for choosing Friendzo!
          </p>

          {sessionId && (
            <div className="mt-8 rounded-2xl bg-muted/30 px-6 py-4 text-sm text-muted-foreground border border-black/5">
              <span className="font-semibold text-foreground">Transaction Session ID:</span> <br/>
              <span className="opacity-80 break-all text-xs">{sessionId}</span>
            </div>
          )}

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center w-full">
            <Button
              onClick={() => router.push("/profile")}
              className="h-14 rounded-2xl px-8 text-base font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto text-white bg-primary hover:bg-primary/90"
            >
              View My Profile
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/store")}
              className="h-14 rounded-2xl px-8 text-base font-bold bg-muted/50 text-foreground hover:bg-muted w-full sm:w-auto group border border-black/10"
            >
              Continue Shopping 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
