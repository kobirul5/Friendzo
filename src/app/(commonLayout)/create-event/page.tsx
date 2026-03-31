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
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(231,218,204,0.85),transparent_28%),radial-gradient(circle_at_top_right,rgba(216,203,191,0.7),transparent_24%),linear-gradient(180deg,#fbf7f2_0%,#f3ede6_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <CreateEventForm />
      </div>
    </main>
  );
}
