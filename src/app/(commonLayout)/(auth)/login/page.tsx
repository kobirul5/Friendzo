"use client";

import LoginForm from "@/components/login-form";
import Link from "next/link";
import { LucideArrowRight } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const LOTTIE_URL = "/Login.json";

export default function LoginPage() {
  const [animationData, setAnimationData] = useState<unknown>(null);

  useEffect(() => {
    fetch(LOTTIE_URL)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Lottie fetch error:", err));
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />

      <div className="container max-w-6xl mx-auto px-4 py-8 z-10">
        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden bg-card/40 backdrop-blur-3xl border border-white/20 rounded-[40px] shadow-2xl shadow-primary/5 min-h-[650px]">
          
          {/* Left Column - Animation */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-primary/5 relative overflow-hidden border-r border-border/50">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10 translate-y-[-10px] animate-in fade-in slide-in-from-top-2 duration-700">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="/assets/logo.png" alt="Friendzo Logo" width={100} height={40} className="h-12 w-auto" />
                  <span className="text-3xl font-black tracking-tighter text-foreground italic drop-shadow-sm">
                    Friendzo
                  </span>
                </Link>
              </div>
              
              <div className="space-y-6 max-w-md animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
                <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-foreground">
                  Connect with your <span className="text-primary">Inner Circle</span> like never before.
                </h1>
                <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                  Join thousands of users who are rediscovering the joy of genuine connections.
                </p>
              </div>
            </div>

            <div className="relative h-[400px] w-full mt-auto flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 delay-500">
              {animationData ? (
                <Lottie 
                  animationData={animationData} 
                  loop={true} 
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Abstract Decorative Circle */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-50" />
          </div>

          {/* Right Column - Login Form */}
          <div className="flex flex-col justify-center p-8 lg:p-16 bg-white/10">
            <div className="w-full max-w-sm mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-1000 delay-300">
              <div className="space-y-3">
                <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
                  Welcome Back
                </h2>
                <p className="text-lg text-muted-foreground font-semibold">
                  Please enter your details to sign in.
                </p>
              </div>

              <LoginForm />

              <div className="pt-6 border-t border-border/50 text-center">
                <p className="text-sm text-muted-foreground font-semibold">
                  Don&apos;t have an account?{" "}
                  <Link 
                    href="/register" 
                    className="text-primary font-black hover:underline inline-flex items-center gap-1 group transition-all"
                  >
                    Join the Circle
                    <LucideArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

