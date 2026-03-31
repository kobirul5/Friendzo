"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyOtp } from "@/services/auth/forgot-password";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LucideShieldCheck, LucideArrowRight } from "lucide-react";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    const otpType = sessionStorage.getItem("otpType");

    if (!storedEmail && !otpType) {
      router.push("/foget-password");
    } else {
      setEmail(storedEmail || "");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is missing. Please try logging in again.");
      return;
    }
    setLoading(true);
    setError("");
    console.log("DEBUG: SUBMITTING OTP FOR EMAIL:", email);
    const res = await verifyOtp(email, otp);

    if (res.success) {
      const otpType = sessionStorage.getItem("otpType");
      if (otpType === "verify") {
        // Clear session storage and redirect to home
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("otpType");
        router.push("/");
      } else {
        router.push("/reset-password");
      }
    } else {
      setError(res.message || "Invalid OTP or expired");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <LucideShieldCheck size={120} />
        </div>

        <CardHeader className="space-y-3 pb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <LucideShieldCheck className="text-primary" size={24} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Verify OTP
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Enter the 4-digit code sent to{" "}
            <span className="text-foreground font-semibold uppercase">
              {email}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="0 0 0 0"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                className="h-16 text-center text-3xl font-mono tracking-[0.5em] bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold transition-all hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0"
              disabled={loading || otp.length < 4}
            >
              {loading ? "Verifying..." : "Verify Code"}
              <LucideArrowRight className="ml-2" size={18} />
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive code?{" "}
              <button className="text-primary font-medium hover:underline">
                Resend
              </button>
            </p>
          </div>
        </CardContent>

        <div className="h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
      </Card>
    </div>
  );
}
