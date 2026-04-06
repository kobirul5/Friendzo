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
import { useActionState, useEffect, useRef } from "react";
import { loginUser } from "@/services/auth/login";
import Link from "next/link";
import { LucideArrowRight, Mail, Lock, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type QuickLoginProps = {
  quickLoginUser?: { email: string; password: string };
  quickLoginAdmin?: { email: string; password: string };
};

export default function LoginForm({ quickLoginUser, quickLoginAdmin }: QuickLoginProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
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
    } else if (state?.errors && state.errors.length > 0) {
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
  }, [state, router]);

  const getErrors = (fieldName: string) => {
    if (!state?.errors) return [];
    return state.errors.filter((err: any) => err.field === fieldName);
  };

  const handleQuickLogin = (email: string, password: string) => {
    const form = formRef.current;
    if (!form) return;

    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;

    if (emailInput && passwordInput) {
      emailInput.value = email;
      passwordInput.value = password;

      form.requestSubmit();
    }
  };

  return (
    <>
      {(quickLoginUser || quickLoginAdmin) && (
        <div className="flex gap-3 mb-6">
          {quickLoginUser && (
            <Button
              type="button"
              onClick={() => handleQuickLogin(quickLoginUser.email, quickLoginUser.password)}
              className="flex-1 h-11 font-bold rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/20 transition-all"
            >
              <User className="mr-2 h-4 w-4" />
              User
            </Button>
          )}
          {quickLoginAdmin && (
            <Button
              type="button"
              onClick={() => handleQuickLogin(quickLoginAdmin.email, quickLoginAdmin.password)}
              className="flex-1 h-11 font-bold rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border border-purple-500/20 transition-all"
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin
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
              disabled={isPending}
              className="h-12 bg-secondary/30 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all rounded-xl"
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
              disabled={isPending}
              className="h-12 bg-secondary/30 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all rounded-xl"
            />
          </FieldContent>
          <FieldError errors={getErrors("password")} />
        </Field>
      </FieldGroup>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 group mt-2"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Sign In
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

