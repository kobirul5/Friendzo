"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type InterestItem = {
  id: string;
  name: string;
  image?: string | null;
};

type FormMode = "create" | "edit";

type AdminInterestManagerProps = {
  initialInterests: InterestItem[];
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80";

export default function AdminInterestManager({
  initialInterests,
}: AdminInterestManagerProps) {
  const [interests, setInterests] = useState<InterestItem[]>(initialInterests);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [activeInterest, setActiveInterest] = useState<InterestItem | null>(null);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const resetForm = () => {
    setName("");
    setImageFile(null);
    setActiveInterest(null);
  };

  const openCreate = () => {
    setFormMode("create");
    resetForm();
    setFeedback("");
    setSheetOpen(true);
  };

  const openEdit = (interest: InterestItem) => {
    setFormMode("edit");
    setActiveInterest(interest);
    setName(interest.name);
    setImageFile(null);
    setFeedback("");
    setSheetOpen(true);
  };

  const previewImage = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    return activeInterest?.image || FALLBACK_IMAGE;
  }, [activeInterest?.image, imageFile]);

  useEffect(() => {
    return () => {
      if (imageFile) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [imageFile, previewImage]);

  const reloadInterests = async () => {
    const res = await fetch("/api/admin/interest", { cache: "no-store" });
    const result = await res.json();
    setInterests(Array.isArray(result?.data) ? result.data : []);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");

      try {
      if (formMode === "create") {
        const payload = new FormData();
        payload.set("name", name);
        if (imageFile) {
          payload.set("file", imageFile);
        }

        const res = await fetch("/api/admin/interest", {
          method: "POST",
          body: payload,
        });

        const result = await res.json();
        if (!res.ok || result?.success === false) {
          setFeedback(result?.message || "Failed to create interest.");
          return;
        }
      } else if (activeInterest) {
        const payload = new FormData();
        payload.set("name", name);
        if (imageFile) {
          payload.set("file", imageFile);
        }

        const res = await fetch(`/api/admin/interest/${activeInterest.id}`, {
          method: "PUT",
          body: payload,
        });

        const result = await res.json();
        if (!res.ok || result?.success === false) {
          setFeedback(result?.message || "Failed to update interest.");
          return;
        }
      }

      await reloadInterests();
      setFeedback(formMode === "create" ? "Interest created successfully." : "Interest updated successfully.");
      setSheetOpen(false);
      resetForm();
    } catch (error) {
      console.error("Interest form submit failed:", error);
      setFeedback("Something went wrong while saving the interest.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (interest: InterestItem) => {
    const confirmed = window.confirm(`Delete "${interest.name}" interest?`);
    if (!confirmed) return;

    setFeedback("");
    try {
      const res = await fetch(`/api/admin/interest/${interest.id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || result?.success === false) {
        setFeedback(result?.message || "Failed to delete interest.");
        return;
      }

      await reloadInterests();
      setFeedback("Interest deleted successfully.");
    } catch (error) {
      console.error("Interest delete failed:", error);
      setFeedback("Something went wrong while deleting the interest.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Interest Management
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Manage discover interests
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Click an interest card menu to edit or delete it. Use create button to add a new interest.
          </p>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button type="button" onClick={openCreate} className="rounded-full px-5">
              <Plus className="h-4 w-4" />
              Create Interest
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>
                {formMode === "create" ? "Create a new interest" : "Update interest"}
              </SheetTitle>
              <SheetDescription>
                {formMode === "create"
                  ? "Add a new interest for profile discovery."
                  : "Update the interest details. Image upload works on edit form."}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="flex h-full flex-col gap-5 px-4 pb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Interest name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gaming" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {formMode === "create" ? "Upload image" : "Upload new image"}
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  required={formMode === "create"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Preview</label>
                <div className="relative overflow-hidden rounded-[1.4rem] border border-primary/10 bg-primary/5">
                  <div className="relative h-44">
                    <Image
                      src={previewImage}
                      alt={name || "Interest preview"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <h3 className="mt-2 text-xl font-semibold">
                        {name || "Interest preview"}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {feedback ? (
                <div className="rounded-2xl bg-primary/8 px-4 py-3 text-sm text-foreground">
                  {feedback}
                </div>
              ) : null}

              <SheetFooter className="px-0">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? formMode === "create"
                      ? "Creating..."
                      : "Updating..."
                    : formMode === "create"
                      ? "Create Interest"
                      : "Save Changes"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {feedback ? (
        <div className="rounded-[1.4rem] border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {interests.map((interest) => (
          <article
            key={interest.id}
            className="overflow-hidden rounded-[1.8rem] border border-black/5 bg-white/92 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.32)]"
          >
            <div className="relative h-44">
              <Image
                src={interest.image || FALLBACK_IMAGE}
                alt={interest.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute right-3 top-3">
                <details className="group relative">
                  <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-white/85 text-foreground shadow">
                    <MoreHorizontal className="h-4 w-4" />
                  </summary>
                  <div className="absolute right-0 z-10 mt-2 w-40 rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
                    <button
                      type="button"
                      onClick={() => openEdit(interest)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-primary/8"
                    >
                      <Pencil className="h-4 w-4" />
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(interest)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </details>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h2 className="mt-2 text-2xl font-semibold">{interest.name}</h2>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
