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
import { registerUser } from "@/services/auth/register";


export default function RegistrationForm() {

  const [state, formAction, isPending] = useActionState(registerUser, null);

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
        {/* Name */}
        <Field>
          <FieldLabel>
            Name <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              name="name"
              placeholder="Enter your name"
              disabled={isPending}
            />
            <FieldDescription>
              Full name of the user
            </FieldDescription>
          </FieldContent>
          {
            getFieldError("name") && (
              <p className="text-red-500">{getFieldError("name")}</p>
            )
          }
        </Field>

        {/* Email */}
        <Field>
          <FieldLabel>
            Email <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              name="email"
              type="email"
              placeholder="Enter email"
              disabled={isPending}
            />
            <FieldDescription>
              We&apos;ll use this to contact you
            </FieldDescription>
          </FieldContent>
          {
            getFieldError("email") && (
              <p className="text-red-500">{getFieldError("name")}</p>
            )
          }
        </Field>

        {/* Address */}
        <Field>
          <FieldLabel>Address (optional)</FieldLabel>
          <FieldContent>
            <Input
              name="address"
              placeholder="Enter address"
              disabled={isPending}
            />
          </FieldContent>
          {
            getFieldError("address") && (
              <p className="text-red-500">{getFieldError("name")}</p>
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
              placeholder="Enter password"
              disabled={isPending}
            />
            <FieldDescription>
              Minimum 6 characters
            </FieldDescription>
          </FieldContent>
          {
            getFieldError("password") && (
              <p className="text-red-500">{getFieldError("name")}</p>
            )
          }
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
              placeholder="Confirm password"
              disabled={isPending}
            />
          </FieldContent>
          {
            getFieldError("confirmPassword") && (
              <p className="text-red-500">{getFieldError("confirmPassword")}</p>
            )
          }
        </Field>

      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Registering..." : "Register User"}
      </Button>
    </form>
  );
}
