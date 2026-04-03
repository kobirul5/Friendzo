import { cookies } from "next/headers";
import AdminUserReportManager from "@/components/shared/admin-user-report-manager";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Server-side fetch for user reports.
 */
async function getUserReports() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/report/user?page=1&limit=50`, {
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const result = await res.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.error("Failed to load user reports server-side:", error);
    return [];
  }
}

export default async function UserReportsPage() {
  const reports = await getUserReports();

  return (
    <div className="pb-10">
      <AdminUserReportManager initialReports={reports} />
    </div>
  );
}
