export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
          Dashboard Home
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Admin content area is ready
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Sidebar, topbar, and dashboard shell are now set up. You can plug each admin page into this layout next.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.6rem] border border-primary/10 bg-primary/5 p-5">
          <p className="text-sm font-semibold text-foreground">Users</p>
          <p className="mt-2 text-3xl font-semibold text-primary">12.4k</p>
          <p className="mt-2 text-sm text-muted-foreground">All user stats panel placeholder</p>
        </div>
        <div className="rounded-[1.6rem] border border-primary/10 bg-primary/5 p-5">
          <p className="text-sm font-semibold text-foreground">Posts</p>
          <p className="mt-2 text-3xl font-semibold text-primary">8.1k</p>
          <p className="mt-2 text-sm text-muted-foreground">Content moderation card placeholder</p>
        </div>
        <div className="rounded-[1.6rem] border border-primary/10 bg-primary/5 p-5">
          <p className="text-sm font-semibold text-foreground">Revenue</p>
          <p className="mt-2 text-3xl font-semibold text-primary">$24k</p>
          <p className="mt-2 text-sm text-muted-foreground">Payments overview placeholder</p>
        </div>
      </div>
    </div>
  );
}
