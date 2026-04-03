/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ImagePlus, LoaderCircle } from "lucide-react";

import { completeProfile } from "@/services/complete-profile";
import { InterestGrid } from "@/components/profile/interest-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

type InterestItem = {
  id?: string;
  name: string;
  image?: string | null;
};

type ProfileData = {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  about?: string | null;
  age?: number | null;
  gender?: string | null;
  interests?: string[];
  profileImage?: string | null;
};

type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
};

const initialState: ActionState = {};

export default function CompleteProfileForm({
  profile,
  interests,
}: {
  profile: ProfileData;
  interests: InterestItem[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(completeProfile, initialState);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);
  const [imagePreview, setImagePreview] = useState<string | null>(profile.profileImage || null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");

  useEffect(() => {
    if (state?.success) {
      router.push("/profile");
      router.refresh();
    }
  }, [router, state]);

  useEffect(() => {
    setImagePreview(profile.profileImage || null);
  }, [profile.profileImage]);

  const getFieldError = (fieldName: string) =>
    state?.errors?.find((error:any) => error.field === fieldName)?.message ?? null;

  const toggleInterest = (interestName: string) => {
    setSelectedInterests((current) =>
      current.includes(interestName)
        ? current.filter((item) => item !== interestName)
        : [...current, interestName]
    );
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setSelectedImageName(file?.name || "");

    setImagePreview((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }

      return file ? URL.createObjectURL(file) : profile.profileImage || null;
    });
  };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_80px_-44px_rgba(88,70,52,0.38)] backdrop-blur-md sm:p-8">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/75">
            Complete profile
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Make your Friendzo profile feel real
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Add your intro, profile photo, basic details, and interests so people can discover you
            properly.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-8 space-y-7">
        <FieldGroup>
          <Field>
            <FieldLabel>Profile image</FieldLabel>
            <FieldContent>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-primary/25 bg-primary/5 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/10">
                {imagePreview ? (
                  <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/70 shadow-sm">
                    <img
                      src={imagePreview}
                      alt="Selected profile preview"
                      className="h-36 w-36 object-cover"
                    />
                  </div>
                ) : (
                  <ImagePlus className="mb-3 h-8 w-8 text-primary" />
                )}
                <span className="text-sm font-semibold text-foreground">Choose a profile image</span>
                <span className="mt-1 text-sm text-muted-foreground">
                  Optional, but it helps your profile stand out.
                </span>
                {selectedImageName ? (
                  <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                    {selectedImageName}
                  </span>
                ) : null}
                <Input
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={isPending}
                  onChange={handleImageChange}
                />
              </label>
              <FieldDescription>Leave empty if you want to keep the current image.</FieldDescription>
            </FieldContent>
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field>
              <FieldLabel>
                First name <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  name="firstName"
                  defaultValue={profile.firstName || ""}
                  placeholder="John"
                  disabled={isPending}
                />
              </FieldContent>
              <FieldError>{getFieldError("firstName")}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Last name</FieldLabel>
              <FieldContent>
                <Input
                  name="lastName"
                  defaultValue={profile.lastName || ""}
                  placeholder="Doe"
                  disabled={isPending}
                />
              </FieldContent>
              <FieldError>{getFieldError("lastName")}</FieldError>
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field>
              <FieldLabel>Phone number</FieldLabel>
              <FieldContent>
                <Input
                  name="phoneNumber"
                  defaultValue={profile.phoneNumber || ""}
                  placeholder="+8801XXXXXXXXX"
                  disabled={isPending}
                />
              </FieldContent>
              <FieldError>{getFieldError("phoneNumber")}</FieldError>
            </Field>

            <Field>
              <FieldLabel>
                Age <span className="text-red-500">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  name="age"
                  type="number"
                  min="18"
                  defaultValue={profile.age || ""}
                  placeholder="24"
                  disabled={isPending}
                />
              </FieldContent>
              <FieldError>{getFieldError("age")}</FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel>
              Gender <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <select
                name="gender"
                defaultValue={profile.gender || ""}
                disabled={isPending}
                className={cn(
                  "flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </FieldContent>
            <FieldError>{getFieldError("gender")}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Address</FieldLabel>
            <FieldContent>
              <Input
                name="address"
                defaultValue={profile.address || ""}
                placeholder="Dhaka, Bangladesh"
                disabled={isPending}
              />
            </FieldContent>
            <FieldError>{getFieldError("address")}</FieldError>
          </Field>

          <Field>
            <FieldLabel>
              About you <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Textarea
                name="about"
                defaultValue={profile.about || ""}
                placeholder="Tell people a little about yourself..."
                className="min-h-32 rounded-2xl"
                disabled={isPending}
              />
              <FieldDescription>
                A short intro helps others understand your vibe and interests.
              </FieldDescription>
            </FieldContent>
            <FieldError>{getFieldError("about")}</FieldError>
          </Field>

          <Field>
            <FieldLabel>
              Interests <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-primary/6 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Available interests</p>
                  <p className="text-xs text-muted-foreground">
                    {interests.length} options loaded, {selectedInterests.length} selected
                  </p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                  {selectedInterests.length} selected
                </div>
              </div>

              {selectedInterests.length > 0 ? (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    >
                      {interest}
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              ) : null}

              {selectedInterests.map((interest) => (
                <input key={interest} type="hidden" name="interests" value={interest} />
              ))}

              {interests.length > 0 ? (
                <InterestGrid
                  interests={interests}
                  emptyMessage="No interests loaded yet"
                  initialCount={6}
                  selectedNames={selectedInterests}
                  onToggle={toggleInterest}
                  gridClassName="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-foreground">No interests loaded yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Interests could not be fetched from the backend right now.
                  </p>
                </div>
              )}
              <FieldDescription>Select the interests that best match you.</FieldDescription>
            </FieldContent>
            <FieldError>{getFieldError("interests")}</FieldError>
          </Field>
        </FieldGroup>

        {state?.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={isPending} className="h-12 rounded-full px-6 text-sm font-semibold">
            {isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Saving profile...
              </>
            ) : (
              "Save profile"
            )}
          </Button>
          <Button asChild type="button" variant="ghost" className="h-12 rounded-full px-6">
            <Link href="/profile">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
