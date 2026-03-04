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
import { useActionState } from "react";
import { loginUser } from "@/services/auth/login";
import Link from "next/link";
import { LucideArrowRight } from "lucide-react";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginUser, null);

  // const getFieldError = (fieldName: string) => {
  //   if (state && state.errors) {
  //     console.log(state.errors,"state.errors");
  //     console.log(fieldName,"fieldName");
  //     const fieldError = state?.errors.find((err: any) => err.field === fieldName);
  //     console.log(fieldError,"fieldError");
  //     return fieldError.message;
  //   } else {
  //     return null;
  //   }
  // }
  const getFieldError = (fieldName: string) => {
    if (!state?.errors) return null;

    const fieldError = state.errors.find(
      (err: any) => err.field === fieldName
    );

    return fieldError?.message ?? null;
  };

  return (
    <form action={formAction} className="space-y-8">
      <FieldGroup>
        {/* Email */}
        <Field>
          <FieldLabel>
            Email <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              disabled={isPending}
            />
            <FieldDescription>
              Registered email address
            </FieldDescription>
          </FieldContent>
          {
            getFieldError("email") && (
              <p className="text-sm text-red-500">{getFieldError("email")}</p>
            )
          }
        </Field>

        {/* Password */}
        <Field>
          <FieldLabel>
            Password <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              name="password"
              type="password"
              placeholder="Enter your password"
              disabled={isPending}
            />
            <FieldDescription>
              Your account password
            </FieldDescription>
          </FieldContent>
          {
            getFieldError("password") && (
              <p className="text-sm text-red-500">{getFieldError("password")}</p>
            )
          }
        </Field>
      </FieldGroup>

      <div className="flex justify-end -mt-4">
        <Link
          href="/foget-password"
          className="text-sm font-medium text-primary hover:underline transition-all"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full h-12 text-base font-semibold group" disabled={isPending}>
        {isPending ? "Logging in..." : "Login"}
        {!isPending && <LucideArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />}
      </Button>
    </form>
  );
}
