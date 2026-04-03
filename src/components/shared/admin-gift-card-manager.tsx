"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, MoreHorizontal, Pencil, Plus, Sparkles, Trash2, UploadCloud } from "lucide-react";

import { toast } from "sonner";
import { confirmToast } from "@/components/shared/ConfirmToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type GiftCardItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: "ESSENTIAL" | "EXCLUSIVE" | "MAJESTIC";
  status: "ACTIVE" | "DELETED";
};

type FormMode = "create" | "edit";

type AdminGiftCardManagerProps = {
  initialGiftCards: GiftCardItem[];
};

export default function AdminGiftCardManager({
  initialGiftCards,
}: AdminGiftCardManagerProps) {
  const [giftCards, setGiftCards] = useState<GiftCardItem[]>(initialGiftCards);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [activeGiftCard, setActiveGiftCard] = useState<GiftCardItem | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"ESSENTIAL" | "EXCLUSIVE" | "MAJESTIC">("ESSENTIAL");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setSelectedFile = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    setImageFile(file);
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory("ESSENTIAL");
    setImageFile(null);
    setActiveGiftCard(null);
  };

  const openCreate = () => {
    setFormMode("create");
    resetForm();
    setSheetOpen(true);
  };

  const openEdit = (giftCard: GiftCardItem) => {
    setFormMode("edit");
    setActiveGiftCard(giftCard);
    setName(giftCard.name);
    setPrice(giftCard.price.toString());
    setCategory(giftCard.category);
    setImageFile(null);
    setSheetOpen(true);
  };

  const previewImage = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    return activeGiftCard?.image;
  }, [activeGiftCard?.image, imageFile]);

  useEffect(() => {
    return () => {
      if (imageFile) {
        URL.revokeObjectURL(previewImage || "");
      }
    };
  }, [imageFile, previewImage]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFile(event.dataTransfer.files?.[0] ?? null);
  };

  const reloadGiftCards = async () => {
    const res = await fetch("/api/admin/gift-card", { cache: "no-store" });
    const result = await res.json();
    setGiftCards(Array.isArray(result?.data) ? result.data : []);
  };

  useEffect(() => {
    void reloadGiftCards();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.set("data", JSON.stringify({
        name,
        price: parseFloat(price),
        category,
      }));

      if (imageFile) {
        payload.set("file", imageFile);
      }

      let res: Response;
      if (formMode === "create") {
        res = await fetch("/api/admin/gift-card", {
          method: "POST",
          body: payload,
        });
      } else if (activeGiftCard) {
        res = await fetch(`/api/admin/gift-card/${activeGiftCard.id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        throw new Error("Invalid form mode");
      }

      const result = await res.json();
      if (!res.ok || result?.success === false) {
        toast.error(result?.message || `Failed to ${formMode} gift card.`);
        return;
      }

      await reloadGiftCards();
      toast.success(formMode === "create" ? "Gift card created successfully." : "Gift card updated successfully.");
      setSheetOpen(false);
      resetForm();
    } catch (error) {
      console.error("Gift card form submit failed:", error);
      toast.error("Something went wrong while saving the gift card.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (giftCard: GiftCardItem) => {
    confirmToast({
      message: `Are you sure you want to delete "${giftCard.name}"? This gift card will no longer be available for purchase.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/gift-card/${giftCard.id}`, {
            method: "DELETE",
          });
          const result = await res.json();

          if (!res.ok || result?.success === false) {
            toast.error(result?.message || "Failed to delete gift card.");
            return;
          }

          await reloadGiftCards();
          toast.success("Gift card deleted successfully.");
        } catch (error) {
          console.error("Gift card delete failed:", error);
          toast.error("Something went wrong while deleting the gift card.");
        }
      },
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ESSENTIAL":
        return "bg-blue-100 text-blue-800";
      case "EXCLUSIVE":
        return "bg-purple-100 text-purple-800";
      case "MAJESTIC":
        return "bg-gold-100 text-gold-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
          <p className="text-muted-foreground">
            Manage gift cards that users can purchase and send to each other.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Gift Card
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {giftCards.map((giftCard) => (
          <div
            key={giftCard.id}
            className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={giftCard.image}
                alt={giftCard.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(giftCard)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(giftCard)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-lg leading-tight">{giftCard.name}</h3>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(giftCard.category)}`}>
                  {giftCard.category}
                </span>
              </div>
              <p className="text-2xl font-bold text-primary">${giftCard.price}</p>
            </div>
          </div>
        ))}
      </div>

      {giftCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No gift cards yet</h3>
          <p className="text-muted-foreground mb-4">Create your first gift card to get started.</p>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Gift Card
          </Button>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {formMode === "create" ? "Create Gift Card" : "Edit Gift Card"}
            </SheetTitle>
            <SheetDescription>
              {formMode === "create"
                ? "Add a new gift card that users can purchase and send."
                : "Update the gift card details."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 ">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter gift card name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value: "ESSENTIAL" | "EXCLUSIVE" | "MAJESTIC") => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESSENTIAL">Essential</SelectItem>
                  <SelectItem value="EXCLUSIVE">Exclusive</SelectItem>
                  <SelectItem value="MAJESTIC">Majestic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 px-6">
              <Label>Image</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {previewImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square w-full max-w-xs mx-auto h-44 overflow-hidden rounded-lg">
                      <Image
                        src={previewImage}
                        alt="Gift card preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-sm font-medium">Upload gift card image</p>
                      <p className="text-xs text-muted-foreground">
                        Drag and drop or click to select
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : formMode === "create" ? "Create" : "Update"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}