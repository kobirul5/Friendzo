import Image from "next/image";
import { cn } from "@/lib/utils";

interface InterestBadgeProps {
  name: string;
  image?: string;
  className?: string;
}

export function InterestBadge({ name, image, className }: InterestBadgeProps) {
  return (
    <div className={cn(
      "group relative flex min-w-[100px] flex-col items-center gap-3 overflow-hidden rounded-2xl bg-muted/30 p-2 transition-all hover:bg-primary/5 hover:shadow-lg",
      className
    )}>
      <div className="relative aspect-square w-full h-16 overflow-hidden rounded-xl border border-border/50">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10">
            <span className="text-xl font-bold text-primary">{name.charAt(0)}</span>
          </div>
        )}
      </div>
      <span className="text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary">
        {name}
      </span>
    </div>
  );
}
