import { cookies } from "next/headers";
import AdminPaymentsManager, {
  type AdminPaymentItem,
  type AdminPaymentsMeta,
} from "@/components/shared/admin-payments-manager";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const DEFAULT_PAGE = "1";
const DEFAULT_LIMIT = "10";

type PaymentsPageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    limit?: string;
  }>;
};

async function getPayments(options: {
  search: string;
  page: string;
  limit: string;
}): Promise<{ payments: AdminPaymentItem[]; meta: AdminPaymentsMeta | null }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const params = new URLSearchParams();

  params.set("page", options.page);
  params.set("limit", options.limit);
  if (options.search) {
    params.set("search", options.search);
  }

  // Try multiple common backend endpoints to find the correct one
  const endpoints = [
    `${BASE_URL}/admin/payment?${params.toString()}`,
    `${BASE_URL}/payment?${params.toString()}`,
    `${BASE_URL}/payments?${params.toString()}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: accessToken
          ? {
              Authorization: accessToken,
              "Content-Type": "application/json",
            }
          : undefined,
        cache: "no-store",
      });

      if (res.ok) {
        const result = await res.json();
        return {
          payments: result?.data?.data || result?.data || [],
          meta: result?.data?.meta || (result?.total ? { total: result.total, page: Number(options.page), limit: Number(options.limit), totalPages: Math.ceil(result.total / Number(options.limit)) } : null),
        };
      }
    } catch (error) {
      console.error(`Failed to fetch from ${endpoint}:`, error);
    }
  }

  return { payments: [], meta: null };
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const search = (resolvedSearchParams.search || "").trim();
  const page = resolvedSearchParams.page || DEFAULT_PAGE;
  const limit = resolvedSearchParams.limit || DEFAULT_LIMIT;

  const { payments, meta } = await getPayments({
    search,
    page,
    limit,
  });

  return (
    <AdminPaymentsManager
      initialPayments={payments}
      meta={meta}
      initialSearch={search}
    />
  );
}
