/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { registerUser } from "@/services/auth/register";
import { useRouter } from "next/navigation";
import { 
  LucideUser, 
  LucideMail, 
  LucidePhone, 
  LucideMapPin, 
  LucideLock, 
  LucideCalendar,
  LucideLoader2,
  LucideArrowRight,
  LucideUserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegistrationForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerUser, null);

  useEffect(() => {
    if (state?.success) {
      const email = state.data?.user?.email || "";
      if (email) {
        sessionStorage.setItem("resetEmail", email);
        sessionStorage.setItem("otpType", "verify");
      }
      router.push("/verify-otp");
    }
  }, [state, router]);

  const getFieldError = (fieldName: string) => {
    if (!state?.errors) return null;

    const fieldError = state.errors.find((err: any) => err.field === fieldName);

    return fieldError?.message ?? null;
  };

  return (
    <form action={formAction} className="space-y-4">
      {state?.success === false && state?.message && (
        <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm border border-red-200">
          {state.message}
        </div>
      )}
      <FieldGroup className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <Field className="space-y-1">
            <FieldLabel className="text-xs font-bold text-foreground/70 ml-1">
              First Name <span className="text-primary italic">*</span>
            </FieldLabel>
            <FieldContent className="relative group">
              <LucideUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <Input 
                name="firstName" 
                placeholder="John" 
                disabled={isPending} 
                className="pl-12 h-12 bg-white/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all font-medium"
              />
            </FieldContent>
            {getFieldError("firstName") && (
              <p className="text-destructive text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                {getFieldError("firstName")}
              </p>
            )}
          </Field>

          {/* Last Name */}
          <Field className="space-y-1">
            <FieldLabel className="text-xs font-bold text-foreground/70 ml-1">Last Name</FieldLabel>
            <FieldContent className="relative group">
              <LucideUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <Input 
                name="lastName" 
                placeholder="Doe" 
                disabled={isPending} 
                className="pl-12 h-12 bg-white/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all font-medium"
              />
            </FieldContent>
            {getFieldError("lastName") && (
              <p className="text-destructive text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                {getFieldError("lastName")}
              </p>
            )}
          </Field>
        </div>

        {/* Email */}
        <Field className="space-y-1">
          <FieldLabel className="text-xs font-bold text-foreground/70 ml-1">
            Email Address <span className="text-primary italic">*</span>
          </FieldLabel>
          <FieldContent className="relative group">
            <LucideMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <Input
              name="email"
              type="email"
              placeholder="john@example.com"
              disabled={isPending}
              className="pl-12 h-12 bg-white/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all font-medium"
            />
          </FieldContent>
          {getFieldError("email") && (
            <p className="text-destructive text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
              {getFieldError("email")}
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Number */}
          <Field className="space-y-1">
            <FieldLabel className="text-xs font-bold text-foreground/70 ml-1">Phone Number</FieldLabel>
            <FieldContent className="relative group">
              <LucidePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <Input
                name="phoneNumber"
                placeholder="+1234567890"
                disabled={isPending}
                className="pl-12 h-12 bg-white/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all font-medium"
              />
            </FieldContent>
            {getFieldError("phoneNumber") && (
              <p className="text-destructive text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                {getFieldError("phoneNumber")}
              </p>
            )}
          </Field>

          {/* Age */}
          <Field className="space-y-1">
            <FieldLabel className="text-xs font-bold text-foreground/70 ml-1">Age</FieldLabel>
            <FieldContent className="relative group">
              <LucideCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <Input
                name="age"
                type="number"
                placeholder="25"
                disabled={isPending}
                className="pl-12 h-12 bg-white/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all font-medium"
              />
            </FieldContent>
            {getFieldError("age") && (
              <p className="text-destructive text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                {getFieldError("age")}
              </p>
            )}
          </Field>
        </div>

        {/* Gender */}
        <Field className="space-y-1">
          <FieldLabel className="text-xs font-bold text-foreground/70 ml-1">Gender</FieldLabel>
          <FieldContent className="relative group">
            <LucideUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <select
              name="gender"
              disabled={isPending}
              className={cn(
                "flex h-12 w-full rounded-xl border border-border/50 bg-white/50 pl-12 pr-3 py-1 text-sm shadow-sm transition-all focus:border-primary/50 focus:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-medium text-foreground/80",
              )}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary">
              <LucideArrowRight size={14} className="rotate-90" />
            </div>
          </FieldContent>
          {getFieldError("gender") && (
            <p className="text-destructive text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
              {getFieldError("gender")}
            </p>
          )}
        </Field>

        {/* Address */}
        <Field className="space-y-1">
          <FieldLabel className="text-xs font-bold text-foreground/70 ml-1">Address</FieldLabel>
          <FieldContent className="relative group">
            <LucideMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <Input
              name="address"
              placeholder="123 Main St, City"
              disabled={isPending}
              className="pl-12 h-12 bg-white/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all font-medium"
            />
          </FieldContent>
          {getFieldError("address") && (
            <p className="text-destructive text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
              {getFieldError("address")}
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <Field className="space-y-1">
            <FieldLabel className="text-xs font-bold text-foreground/70 ml-1">
              Password <span className="text-primary italic">*</span>
            </FieldLabel>
            <FieldContent className="relative group">
              <LucideLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                className="pl-12 h-12 bg-white/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all font-medium"
              />
            </FieldContent>
            {getFieldError("password") && (
              <p className="text-destructive text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                {getFieldError("password")}
              </p>
            )}
          </Field>

          {/* Confirm Password */}
          <Field className="space-y-1">
            <FieldLabel className="text-xs font-bold text-foreground/70 ml-1">
              Confirm Password <span className="text-primary italic">*</span>
            </FieldLabel>
            <FieldContent className="relative group">
              <LucideLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <Input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                className="pl-12 h-12 bg-white/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all font-medium"
              />
            </FieldContent>
            {getFieldError("confirmPassword") && (
              <p className="text-destructive text-xs font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                {getFieldError("confirmPassword")}
              </p>
            )}
          </Field>
        </div>
      </FieldGroup>

      <Button 
        type="submit" 
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 group" 
        disabled={isPending}
      >
        {isPending ? (
          <>
            <LucideLoader2 className="animate-spin" size={20} />
            <span>Creating Circle...</span>
          </>
        ) : (
          <>
            <span>Start Your Journey</span>
            <LucideArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
          </>
        )}
      </Button>
    </form>
  );
}
