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
  MoreVertical
} from "lucide-react";
import { toast } from "sonner";

import { confirmToast } from "@/components/shared/ConfirmToast";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

type ReportedUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
};

type ReportItem = {
  id: string;
  description: string;
  createdAt: string;
  reportedUser: ReportedUser;
};

type AdminUserReportManagerProps = {
  initialReports: ReportItem[];
};

export default function AdminUserReportManager({
  initialReports,
}: AdminUserReportManagerProps) {
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
            Safety Monitoring
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            User Reports
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Review and manage reports submitted against users. You can dismiss false reports or take action through the user profile.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
          const reportedUser = report.reportedUser;
          const fullName = [reportedUser.firstName, reportedUser.lastName].filter(Boolean).join(" ") || "Unknown User";

          return (
            <article
              key={report.id}
              className="group relative flex flex-col overflow-hidden rounded-[2.2rem] border border-black/5 bg-white/90 p-6 shadow-[0_18px_40px_-35px_rgba(95,76,55,0.2)] transition-all hover:shadow-[0_25px_50px_-30px_rgba(95,76,55,0.25)] dark:bg-zinc-900/90 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-primary/5">
                    {reportedUser.profileImage ? (
                      <Image
                        src={reportedUser.profileImage}
                        alt={fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        <UserIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground line-clamp-1">{fullName}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Reported User</p>
                  </div>
                </div>

                <div className="rounded-full bg-red-50 p-2 text-red-500 dark:bg-red-500/10 dark:text-red-400 shadow-sm border border-red-100 dark:border-red-500/20">
                   <AlertCircle className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-6 flex-1 rounded-[1.4rem] bg-black/5 dark:bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Reason for report</p>
                <p className="text-sm leading-relaxed text-foreground/80 font-medium italic select-all">
                  "{report.description}"
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {new Date(report.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex gap-2">
                   <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                    className="h-9 w-9 rounded-full p-0 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                    title="Dismiss Report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full px-4 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold"
                  >
                    View Profile
                  </Button>
                </div>
              </div>

               {/* Decorative Gradient Overlay */}
               <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </article>
          );
        })}

        {reports.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-[2.5rem] border-2 border-dashed border-primary/15 bg-white/40 dark:bg-white/5 backdrop-blur-sm">
             <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-pulse">
               <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Clean Slate!</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto font-medium">
              There are currently no reports filed against any users. The community is behaving well!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
