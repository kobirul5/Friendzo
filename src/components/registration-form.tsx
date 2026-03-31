/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { registerUser } from "@/services/auth/register";
import { useRouter } from "next/navigation";
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
    <form action={formAction} className="space-y-8">
      {state?.success === false && state?.message && (
        <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm border border-red-200">
          {state.message}
        </div>
      )}
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <Field>
            <FieldLabel>
              First Name <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Input name="firstName" placeholder="John" disabled={isPending} />
            </FieldContent>
            {getFieldError("firstName") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("firstName")}
              </p>
            )}
          </Field>

          {/* Last Name */}
          <Field>
            <FieldLabel>Last Name</FieldLabel>
            <FieldContent>
              <Input name="lastName" placeholder="Doe" disabled={isPending} />
            </FieldContent>
            {getFieldError("lastName") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("lastName")}
              </p>
            )}
          </Field>
        </div>

        {/* Email */}
        <Field>
          <FieldLabel>
            Email <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              name="email"
              type="email"
              placeholder="john@example.com"
              disabled={isPending}
            />
          </FieldContent>
          {getFieldError("email") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("email")}
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Number */}
          <Field>
            <FieldLabel>Phone Number</FieldLabel>
            <FieldContent>
              <Input
                name="phoneNumber"
                placeholder="+1234567890"
                disabled={isPending}
              />
            </FieldContent>
            {getFieldError("phoneNumber") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("phoneNumber")}
              </p>
            )}
          </Field>

          {/* Age */}
          <Field>
            <FieldLabel>Age</FieldLabel>
            <FieldContent>
              <Input
                name="age"
                type="number"
                placeholder="25"
                disabled={isPending}
              />
            </FieldContent>
            {getFieldError("age") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("age")}
              </p>
            )}
          </Field>
        </div>

        {/* Gender */}
        <Field>
          <FieldLabel>Gender</FieldLabel>
          <FieldContent>
            <select
              name="gender"
              disabled={isPending}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <option value="">Select Gender</option>
              <option value="HIM">Male (HIM)</option>
              <option value="HER">Female (HER)</option>
              <option value="EVERYONE">Other (EVERYONE)</option>
            </select>
          </FieldContent>
          {getFieldError("gender") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("gender")}
            </p>
          )}
        </Field>

        {/* Address */}
        <Field>
          <FieldLabel>Address</FieldLabel>
          <FieldContent>
            <Input
              name="address"
              placeholder="123 Main St, City"
              disabled={isPending}
            />
          </FieldContent>
          {getFieldError("address") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("address")}
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <Field>
            <FieldLabel>
              Password <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
              />
            </FieldContent>
            {getFieldError("password") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("password")}
              </p>
            )}
          </Field>

          {/* Confirm Password */}
          <Field>
            <FieldLabel>
              Confirm Password <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
              />
            </FieldContent>
            {getFieldError("confirmPassword") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("confirmPassword")}
              </p>
            )}
          </Field>
        </div>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Registering..." : "Create Account"}
      </Button>
    </form>
  );
}
