/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loginUser } from "@/services/auth/login";
import Link from "next/link";
import { LucideArrowRight, Mail, Lock, User, Shield, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type QuickLoginProps = {
  quickLoginUser?: { email: string; password: string };
  quickLoginAdmin?: { email: string; password: string };
};

export default function LoginForm({ quickLoginUser, quickLoginAdmin }: QuickLoginProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [quickRole, setQuickRole] = useState<"user" | "admin" | null>(null);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-cache destination routes as soon as login page loads to ensure instant transitions
  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/verify-otp");
  }, [router]);

  useEffect(() => {
    if (state?.success) {
      setIsRedirecting(true);
      if (state.data?.isVerified) {
        toast.success("Login successful!", {
          description: "Welcome back!",
        });
        router.push("/");
      } else {
        // Redirection for unverified users
        const email = state?.data?.email || "";
        if (email) {
          sessionStorage.setItem("resetEmail", email);
          sessionStorage.setItem("otpType", "verify");
        }
        toast.info("Email verification required", {
          description: "Please verify your email to continue.",
        });
        router.push("/verify-otp");
      }
    } else {
      setIsRedirecting(false);
      setQuickRole(null);

      if (state?.errors && state.errors.length > 0) {
        const errorMessage = state.errors
          .map((err: any) => err.message)
          .join(", ");
        toast.error("Login failed", {
          description: errorMessage,
        });
      } else if (state?.success === false && state?.message) {
        toast.error("Login failed", {
          description: state.message,
        });
      } else if (state?.success === false) {
        toast.error("Login failed", {
          description: "Invalid email or password. Please try again.",
        });
      }
    }
  }, [state, router]);

  const getErrors = (fieldName: string) => {
    if (!state?.errors) return [];
    return state.errors.filter((err: any) => err.field === fieldName);
  };

  const handleQuickLogin = (email: string, password: string, role: "user" | "admin") => {
    const form = formRef.current;
    if (!form) return;

    setQuickRole(role);

    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;

    if (emailInput && passwordInput) {
      emailInput.value = email;
      passwordInput.value = password;

      form.requestSubmit();
    }
  };

  const isLoading = isPending || isRedirecting;

  return (
    <>
      {/* Full-screen Redirect Modal */}
      {mounted && isRedirecting && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-[32px] bg-card/95 border border-white/20 p-8 shadow-2xl shadow-primary/25 text-center space-y-6 animate-in zoom-in-95 fade-in duration-300">
            {/* Animated glowing spinner */}
            <div className="relative mx-auto flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-primary/25 blur-xl animate-pulse" />
              <div className="relative flex items-center justify-center w-18 h-18 rounded-full bg-primary/10 border border-primary/25 shadow-inner">
                <LoaderCircle className="h-9 w-9 text-primary animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                Welcome Back!
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                {state?.data?.isVerified
                  ? "Login successful! Redirecting to feed..."
                  : "Redirecting to verification..."}
              </p>
            </div>

            {/* Smooth animated progress line */}
            <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-full" />
            </div>
          </div>
        </div>,
        document.body
      )}

      {(quickLoginUser || quickLoginAdmin) && (
        <div className="flex gap-3 mb-6">
          {quickLoginUser && (
            <Button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin(quickLoginUser.email, quickLoginUser.password, "user")}
              className="flex-1 h-11 font-bold rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/20 transition-all disabled:opacity-60"
            >
              {isLoading && quickRole === "user" ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <User className="mr-2 h-4 w-4" />
              )}
              {isLoading && quickRole === "user" ? "Signing in..." : "User"}
            </Button>
          )}
          {quickLoginAdmin && (
            <Button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin(quickLoginAdmin.email, quickLoginAdmin.password, "admin")}
              className="flex-1 h-11 font-bold rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border border-purple-500/20 transition-all disabled:opacity-60"
            >
              {isLoading && quickRole === "admin" ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              {isLoading && quickRole === "admin" ? "Signing in..." : "Admin"}
            </Button>
          )}
        </div>
      )}

      <form action={formAction} className="space-y-6" ref={formRef}>
        <FieldGroup className="gap-6">
          {/* Email */}
          <Field>
            <FieldLabel className="text-foreground/70 font-semibold mb-1 flex items-center gap-2">
              <Mail size={16} className="text-primary/70" />
              Email Address
            </FieldLabel>
            <FieldContent>
              <Input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                disabled={isLoading}
                className="h-12 bg-secondary/30 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all rounded-xl disabled:opacity-60"
              />
            </FieldContent>
            <FieldError errors={getErrors("email")} />
          </Field>

          {/* Password */}
          <Field className="relative">
            <div className="flex justify-between items-center mb-1">
              <FieldLabel className="text-foreground/70 font-semibold flex items-center gap-2">
                <Lock size={16} className="text-primary/70" />
                Password
              </FieldLabel>
              <Link
                href="/foget-password"
                className="text-xs font-bold text-primary hover:underline transition-all"
              >
                Forgot password?
              </Link>
            </div>
            <FieldContent>
              <Input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                disabled={isLoading}
                className="h-12 bg-secondary/30 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all rounded-xl disabled:opacity-60"
              />
            </FieldContent>
            <FieldError errors={getErrors("password")} />
          </Field>
        </FieldGroup>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-75 group mt-2"
          disabled={isLoading}
        >
          {isRedirecting ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="h-5 w-5 animate-spin text-primary-foreground" />
              <span>Redirecting to feed...</span>
            </span>
          ) : isPending ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="h-5 w-5 animate-spin text-primary-foreground" />
              <span>Signing in...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Sign In</span>
              <LucideArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={18}
              />
            </span>
          )}
        </Button>
      </form>
    </>
  );
}


