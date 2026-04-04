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
import { useActionState, useEffect } from "react";
import { loginUser } from "@/services/auth/login";
import Link from "next/link";
import { LucideArrowRight, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginUser, null);

  useEffect(() => {
    if (state?.success) {
      if (state.data?.isVerified) {
        router.push("/");
      } else {
        // Redirection for unverified users
        const email = state?.data?.email || "";
        if (email) {
          sessionStorage.setItem("resetEmail", email);
          sessionStorage.setItem("otpType", "verify");
        }
        router.push("/verify-otp");
      }
    }
  }, [state, router]);

  const getErrors = (fieldName: string) => {
    if (!state?.errors) return [];
    return state.errors.filter((err: any) => err.field === fieldName);
  };

  return (
    <form action={formAction} className="space-y-6">
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
  );
}

