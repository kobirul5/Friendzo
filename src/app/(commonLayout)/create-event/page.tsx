import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import CreateEventForm from "@/components/create-event-form";

export default async function CreateEventPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(245,235,224,0.92),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(226,210,196,0.62),transparent_24%),linear-gradient(180deg,#fcfaf7_0%,#f4ece3_52%,#ecdfd2_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="container mx-auto max-w-5xl">
        <CreateEventForm />
      </div>
    </main>
  );
}
