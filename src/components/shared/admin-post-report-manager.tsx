"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Trash2, 
  User as UserIcon,
  CheckCircle2,
  Image as ImageIcon,
  MoreVertical
} from "lucide-react";
import { toast } from "sonner";

import { confirmToast } from "@/components/shared/ConfirmToast";
import { Button } from "@/components/ui/button";

type Reporter = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
};

type PostItem = {
    id: string;
    image: string;
    description: string;
};

type ReportItem = {
  id: string;
  description: string;
  createdAt: string;
  reporter: Reporter;
  memory: PostItem;
};

type AdminPostReportManagerProps = {
  initialReports: ReportItem[];
};

export default function AdminPostReportManager({
  initialReports,
}: AdminPostReportManagerProps) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);

  const handleDelete = (reportId: string) => {
    confirmToast({
      message: "Are you sure you want to dismiss this report? This action will permanently remove it from the dashboard.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/reports/${reportId}`, {
            method: "DELETE",
          });
          const result = await res.json();

          if (!res.ok || result?.success === false) {
            toast.error(result?.message || "Failed to dismiss report.");
            return;
          }

          setReports((prev) => prev.filter((r) => r.id !== reportId));
          toast.success("Report dismissed successfully.");
        } catch (error) {
          console.error("Failed to delete report:", error);
          toast.error("Something went wrong while deleting the report.");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Content Safety
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Post Reports
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Review and manage reports submitted against memories/posts. You can view the content, the reporter, and the reason for the report.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const reporter = report.reporter;
          const memory = report.memory;
          const reporterName = [reporter.firstName, reporter.lastName].filter(Boolean).join(" ") || "Unknown User";

          return (
            <article
              key={report.id}
              className="group relative flex flex-col overflow-hidden rounded-[2.2rem] border border-black/5 bg-white/90 p-5 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.2)] transition-all hover:shadow-[0_25px_50px_-30px_rgba(95,76,55,0.25)] dark:bg-zinc-900/90 dark:border-white/10"
            >
              {/* Post Preview */}
              <div className="relative aspect-video w-full overflow-hidden rounded-[1.6rem] bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/5 shadow-inner">
                {memory?.image ? (
                  <Image
                    src={memory.image}
                    alt={memory.description}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                
                {/* Overlay Badge */}
                <div className="absolute right-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
                   REPORTED
                </div>
              </div>

              <div className="mt-6 space-y-4">
                 <div className="rounded-[1.4rem] bg-black/5 dark:bg-white/5 p-4 border border-black/5 transition-colors group-hover:bg-primary/3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Report Reason</p>
                  <p className="text-sm leading-relaxed text-foreground/80 font-medium italic select-all">
                    "{report.description}"
                  </p>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-primary/5 shadow-sm">
                      {reporter.profileImage ? (
                        <Image
                          src={reporter.profileImage}
                          alt={reporterName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-1">Reporter</p>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">{reporterName}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(report.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2 border-t border-black/5 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(report.id)}
                  className="h-10 flex-1 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  className="h-10 flex-1 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold shadow-sm"
                >
                  View Post
                </Button>
              </div>

               {/* Corner decoration */}
               <div className="absolute -bottom-6 -right-6 h-28 w-28 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors" />
            </article>
          );
        })}

        {reports.length === 0 && (
          <div className="col-span-full py-24 text-center rounded-[2.5rem] border-2 border-dashed border-primary/15 bg-white/40 dark:bg-white/5 backdrop-blur-sm shadow-inner">
             <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-pulse">
               <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="text-3xl font-black text-foreground">Perfect Content!</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto font-bold uppercase tracking-widest opacity-60">
              Zero reported memories found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
