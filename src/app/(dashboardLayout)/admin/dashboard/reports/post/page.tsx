import { cookies } from "next/headers";
import AdminPostReportManager from "@/components/shared/admin-post-report-manager";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Server-side fetch for post reports.
 */
async function getPostReports() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/report/post?page=1&limit=50`, {
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
    console.error("Failed to load post reports server-side:", error);
    return [];
  }
}

export default async function PostReportsPage() {
  const reports = await getPostReports();

  return (
    <div className="pb-10">
      <AdminPostReportManager initialReports={reports} />
    </div>
  );
}
