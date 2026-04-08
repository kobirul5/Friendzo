import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const PAGE_SIZE_FOR_CRON = 100;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type EventItem = {
  id: string;
  startedAt?: string | null;
};

type PaginatedEventsResponse = {
  success?: boolean;
  message?: string;
  data?: EventItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  } | null;
};

function addOneDay(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getTime() + DAY_IN_MS).toISOString();
}

async function fetchEventPage(accessToken: string, page: number) {
  const res = await fetch(`${BASE_URL}/events/paginated?page=${page}&limit=${PAGE_SIZE_FOR_CRON}`, {
    method: "GET",
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const result = (await res.json()) as PaginatedEventsResponse;

  if (!res.ok || !result?.success) {
    throw new Error(result?.message || `Failed to load events page ${page}.`);
  }

  return result;
}

async function updateEventStartedAt(accessToken: string, eventId: string, startedAt: string) {
  const payload = JSON.stringify({ startedAt });
  const methods: Array<"PUT" | "PATCH"> = ["PUT", "PATCH"];
  let lastMessage = `Failed to update event ${eventId}.`;

  for (const method of methods) {
    const res = await fetch(`${BASE_URL}/events/${eventId}`, {
      method,
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: payload,
      cache: "no-store",
    });

    const result = await res.json().catch(() => null);

    if (res.ok && result?.success !== false) {
      return { success: true as const, method };
    }

    lastMessage = result?.message || lastMessage;
  }

  return { success: false as const, message: lastMessage };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cronAction = searchParams.get("cron");

  if (cronAction === "shift-started-at") {
    const accessToken =
      process.env.CRON_EVENT_ACCESS_TOKEN ||
      process.env.EVENTS_CRON_ACCESS_TOKEN ||
      process.env.ADMIN_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing cron auth token. Set CRON_EVENT_ACCESS_TOKEN (or EVENTS_CRON_ACCESS_TOKEN) in your environment.",
        },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV === "production" && request.headers.get("x-vercel-cron") !== "1") {
      return NextResponse.json({ success: false, message: "Cron requests only." }, { status: 403 });
    }

    let page = 1;
    let fetchedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    try {
      while (page < 1000) {
        const result = await fetchEventPage(accessToken, page);
        const events = Array.isArray(result.data) ? result.data : [];
        const meta = result.meta ?? null;

        if (events.length === 0) {
          break;
        }

        fetchedCount += events.length;

        for (const event of events) {
          if (!event.startedAt) {
            skippedCount += 1;
            continue;
          }

          const nextStartedAt = addOneDay(event.startedAt);
          if (!nextStartedAt) {
            skippedCount += 1;
            continue;
          }

          const updateResult = await updateEventStartedAt(accessToken, event.id, nextStartedAt);

          if (updateResult.success) {
            updatedCount += 1;
          } else {
            failedCount += 1;
          }
        }

        if (!meta || meta.page * meta.limit >= meta.total || events.length < (meta.limit || PAGE_SIZE_FOR_CRON)) {
          break;
        }

        page += 1;
      }

      revalidatePath("/events");
      revalidatePath("/");
      revalidatePath("/profile");

      return NextResponse.json({
        success: true,
        message: "Event start dates shifted by one day.",
        data: {
          fetchedCount,
          updatedCount,
          skippedCount,
          failedCount,
        },
      });
    } catch (error) {
      console.error("Failed to shift event start dates:", error);

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Failed to shift event start dates.",
          data: {
            fetchedCount,
            updatedCount,
            skippedCount,
            failedCount,
          },
        },
        { status: 500 }
      );
    }
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Please login first.", data: [], meta: null },
      { status: 401 }
    );
  }

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "6";

  try {
    const res = await fetch(`${BASE_URL}/events/paginated?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Failed to proxy paginated events:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load paginated events.", data: [], meta: null },
      { status: 500 }
    );
  }
}
