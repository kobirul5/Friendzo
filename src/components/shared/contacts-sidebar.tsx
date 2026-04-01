import { UserCircle2 } from "lucide-react";

type OnlineUser = {
  id: string;
  name: string;
  handle: string;
  mood: string;
};

const defaultOnlineUsers: OnlineUser[] = [
  { id: "1", name: "Ariana Sen", handle: "@ariana", mood: "Planning a meetup" },
  { id: "2", name: "Rafi Ahmed", handle: "@rafi", mood: "Sharing travel shots" },
  { id: "3", name: "Maya Noor", handle: "@maya", mood: "Looking for new friends" },
  { id: "4", name: "Tanvir Joy", handle: "@tanvir", mood: "Online and active" },
  { id: "5", name: "Lamia Tasnim", handle: "@lamia", mood: "Commenting on memories" },
];

type ContactsSidebarProps = {
  title?: string;
  description?: string;
  users?: OnlineUser[];
};

export default function ContactsSidebar({
  title = "Demo contacts panel",
  description = "Right sidebar currently uses demo online user data. Later we can wire it to live socket presence.",
  users = defaultOnlineUsers,
}: ContactsSidebarProps) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-5">
        <div className="rounded-[2rem] border border-white/65 bg-white/82 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Contacts
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">Online now</h2>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {users.length} active
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {users.map((user) => {
              const initials = user.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("");

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-2xl bg-muted/25 px-3 py-3"
                >
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                    {initials || "F"}
                    <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.handle}</p>
                    <p className="truncate text-xs text-muted-foreground/90">{user.mood}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/65 bg-white/82 p-5 shadow-[0_20px_60px_-40px_rgba(88,70,52,0.45)] backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
