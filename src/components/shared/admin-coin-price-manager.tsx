"use client";

import { useEffect, useState } from "react";
import { BadgeDollarSign, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { confirmToast } from "@/components/shared/ConfirmToast";
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

type CoinPriceItem = {
  id: string;
  coinAmount: string;
  price: number;
  createdAt: string;
};

type FormMode = "create" | "edit";

type AdminCoinPriceManagerProps = {
  initialCoinPrices: CoinPriceItem[];
};

export default function AdminCoinPriceManager({
  initialCoinPrices,
}: AdminCoinPriceManagerProps) {
  const [coinPrices, setCoinPrices] = useState<CoinPriceItem[]>(initialCoinPrices);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [activeCoinPrice, setActiveCoinPrice] = useState<CoinPriceItem | null>(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadCoinPrices = async () => {
    try {
      const res = await fetch("/api/admin/coins", { cache: "no-store" });
      const result = await res.json();
      setCoinPrices(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      console.error("Failed to reload coin prices:", error);
    }
  };

  useEffect(() => {
    void reloadCoinPrices();
  }, []);

  const resetForm = () => {
    setCoinAmount("");
    setPrice("");
    setActiveCoinPrice(null);
  };

  const openCreate = () => {
    setFormMode("create");
    resetForm();
    setSheetOpen(true);
  };

  const openEdit = (coinPrice: CoinPriceItem) => {
    setFormMode("edit");
    setActiveCoinPrice(coinPrice);
    setCoinAmount(coinPrice.coinAmount);
    setPrice(coinPrice.price.toString());
    setSheetOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        coinAmount,
        price: parseFloat(price),
      };

      let res: Response;
      if (formMode === "create") {
        res = await fetch("/api/admin/coins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (activeCoinPrice) {
        res = await fetch(`/api/admin/coins/${activeCoinPrice.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        throw new Error("Invalid form mode");
      }

      const result = await res.json();
      if (!res.ok || result?.success === false) {
        toast.error(result?.message || `Failed to ${formMode} coin package.`);
        return;
      }

      await reloadCoinPrices();
      toast.success(
        formMode === "create"
          ? "Coin package created successfully."
          : "Coin package updated successfully."
      );
      setSheetOpen(false);
      resetForm();
    } catch (error) {
      console.error("Coin price form submit failed:", error);
      toast.error("Something went wrong while saving the coin package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (coinPrice: CoinPriceItem) => {
    confirmToast({
      message: `Are you sure you want to delete this package of ${coinPrice.coinAmount} coins for $${coinPrice.price}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/coins/${coinPrice.id}`, {
            method: "DELETE",
          });
          const result = await res.json();

          if (!res.ok || result?.success === false) {
            toast.error(result?.message || "Failed to delete coin package.");
            return;
          }

          await reloadCoinPrices();
          toast.success("Coin package deleted successfully.");
        } catch (error) {
          console.error("Coin price delete failed:", error);
          toast.error("Something went wrong while deleting the coin package.");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Coin Pricing
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Manage Coin Prices
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Configure the coin packages available for users to purchase. These coins can be used
            for various platform activities.
          </p>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              onClick={openCreate}
              className="w-full rounded-full px-6 sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto border-l-white/60 bg-[linear-gradient(180deg,#fffdf9_0%,#f7f1e8_100%)] sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>
                {formMode === "create" ? "Add New Coin Package" : "Update Coin Package"}
              </SheetTitle>
              <SheetDescription>
                {formMode === "create"
                  ? "Define a new coin package with amount and price."
                  : "Update the details of the existing coin package."}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
              <div className="rounded-[1.4rem] border border-white/80 bg-white/85 p-5 shadow-[0_20px_45px_-35px_rgba(95,76,55,0.32)]">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Package Details
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Coin Amount</label>
                    <Input
                      value={coinAmount}
                      onChange={(e) => setCoinAmount(e.target.value)}
                      placeholder="e.g. 500"
                      required
                      className="h-12 rounded-xl border-primary/10 bg-primary/5 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 9.99"
                      required
                      className="h-12 rounded-xl border-primary/10 bg-primary/5 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl px-6 text-sm font-bold shadow-lg transition-all active:scale-95 sm:w-auto"
                >
                  {isSubmitting
                    ? formMode === "create"
                      ? "Creating..."
                      : "Updating..."
                    : formMode === "create"
                      ? "Add Package"
                      : "Save Changes"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {coinPrices.map((pkg) => (
          <article
            key={pkg.id}
            className="group relative overflow-hidden rounded-[2.2rem] border border-black/5 bg-white/90 p-6 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.25)] transition-all hover:shadow-[0_25px_50px_-30px_rgba(95,76,55,0.3)] dark:border-white/10 dark:bg-zinc-900/90"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-amber-50 text-amber-500 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20 shadow-sm">
                <BadgeDollarSign className="h-7 w-7" />
              </div>
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => openEdit(pkg)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary opacity-0 transition-all hover:bg-primary/10 group-hover:opacity-100"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pkg)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/5 text-destructive opacity-0 transition-all hover:bg-destructive/10 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black tracking-tight text-foreground">
                  {pkg.coinAmount}
                </h3>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  Coins
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-2xl font-bold text-primary">
                  ${pkg.price.toFixed(2)}
                </p>
                <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Best Value
                </p>
              </div>
            </div>

            {/* Corner decoration */}
            <div className="absolute -bottom-6 -right-6 h-28 w-28 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          </article>
        ))}

        {coinPrices.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-[2.2rem] border-2 border-dashed border-primary/15 bg-white/40 dark:bg-white/5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
               <Plus className="h-8 w-8" />
            </div>
            <p className="text-xl font-bold text-foreground">No coin packages found</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              Start by adding your first pricing package to enable coin purchases.
            </p>
            <Button variant="outline" onClick={openCreate} className="mt-6 rounded-full border-primary/20 hover:bg-primary/5">
              Create Package
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
