"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, CreditCard, ExternalLink, Filter } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

export type AdminPaymentItem = {
  id: string;
  transactionId?: string | null;
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  paymentMethod: string;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profileImage?: string | null;
  } | null;
};

export type AdminPaymentsMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

type AdminPaymentsManagerProps = {
  initialPayments: AdminPaymentItem[];
  meta?: AdminPaymentsMeta | null;
  initialSearch?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminPaymentsManager({
  initialPayments,
  meta,
  initialSearch = "",
}: AdminPaymentsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const payments = useMemo(() => initialPayments, [initialPayments]);
  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const totalRecords = meta?.total ?? payments.length;
  const limit = meta?.limit ?? 10;

  const updateRouteParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateRouteParams({
      search: search.trim() || null,
      page: "1",
    });
  };

  const handleLimitChange = (value: string) => {
    updateRouteParams({
      limit: value,
      page: "1",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Summary Placeholder */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Business Management
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Payment Transactions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor and manage all financial transactions across the platform.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-primary/7 px-4 py-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4 text-primary" />
          <span>{totalRecords} transactions</span>
        </div>
      </div>

      {/* Toolbar: Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-md flex-1"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by Transaction ID or Email"
            className="h-12 rounded-2xl border-primary/10 bg-white/80 pl-11 shadow-sm backdrop-blur-sm"
          />
        </form>

        <div className="flex items-center gap-2">
          <button className="inline-flex h-12 items-center gap-2 rounded-2xl border border-primary/10 bg-white/80 px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-primary/5">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_50px_-40px_rgba(95,76,55,0.3)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#fcfaf8]">
              <tr className="text-left text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/60">
                <th className="px-6 py-5">SL</th>
                <th className="px-4 py-5">User</th>
                <th className="px-4 py-5">Transaction ID</th>
                <th className="px-4 py-5">Amount</th>
                <th className="px-4 py-5">Method</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-4 py-5">Date</th>
                <th className="px-6 py-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {payments.length > 0 ? (
                payments.map((payment, index) => {
                  const userName =
                    [payment.user?.firstName, payment.user?.lastName]
                      .filter(Boolean)
                      .join(" ")
                      .trim() || "Unknown User";
                  const serialNumber = (currentPage - 1) * limit + index + 1;
                  const statusColors = {
                    SUCCESS: "bg-emerald-500/10 text-emerald-600",
                    FAILED: "bg-rose-500/10 text-rose-600",
                    PENDING: "bg-amber-500/10 text-amber-600",
                  };

                  return (
                    <tr
                      key={payment.id}
                      className="group text-sm transition-colors hover:bg-primary/[0.02]"
                    >
                      <td className="px-6 py-5 font-medium text-foreground/40">
                        {serialNumber}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10">
                            {payment.user?.profileImage ? (
                              <Image
                                src={payment.user.profileImage}
                                alt={userName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {userName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {payment.user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className="font-mono text-xs font-medium text-foreground/70">
                          {payment.transactionId || payment.id.slice(0, 12)}
                        </span>
                      </td>
                      <td className="px-4 py-5 font-semibold text-foreground">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusColors[payment.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-foreground/70">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary opacity-0 transition group-hover:opacity-100 group-hover:hover:bg-primary group-hover:hover:text-primary-foreground">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center">
                      <CreditCard className="mb-4 h-12 w-12 text-muted-foreground/30" />
                      <p className="text-lg font-semibold text-foreground">
                        No transactions found
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try adjusting your search or filters to find what you
                        are looking for.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col gap-4 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span>Showing</span>
          <select
            value={String(limit)}
            onChange={(event) => handleLimitChange(event.target.value)}
            className="h-10 rounded-xl border border-primary/10 bg-white/80 px-3 text-foreground outline-none backdrop-blur-sm"
          >
            {[10, 20, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>records per page</span>
        </div>

        <p className="font-medium">
          Showing {(currentPage - 1) * limit + (payments.length ? 1 : 0)} to{" "}
          {(currentPage - 1) * limit + payments.length} out of {totalRecords}{" "}
          records
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1 || isPending}
            onClick={() => updateRouteParams({ page: String(currentPage - 1) })}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-white/80 text-foreground transition hover:bg-primary/5 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {"<"}
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
            const pageNum = index + 1; // Simplistic pagination logic for now
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => updateRouteParams({ page: String(pageNum) })}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                  currentPage === pageNum
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-white/80 text-foreground/70 hover:bg-primary/5"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages || isPending}
            onClick={() => updateRouteParams({ page: String(currentPage + 1) })}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-white/80 text-foreground transition hover:bg-primary/5 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
