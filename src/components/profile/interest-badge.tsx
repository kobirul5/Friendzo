import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterestBadgeProps {
  name: string;
  image?: string;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function InterestBadge({
  name,
  image,
  className,
  selected = false,
  onClick,
}: InterestBadgeProps) {
  const [imgError, setImgError] = useState(false);

  const baseClassName = cn(
    "group relative aspect-[0.92] w-full overflow-hidden rounded-[1.4rem] text-left transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    onClick ? "cursor-pointer" : "",
    selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
    className
  );

  const content = (
    <>
      <div className="absolute inset-0">
        <Image
          src={imgError || !image ? "/fallback.jpg" : image}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />

      {selected ? (
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm">
          <Check className="h-4 w-4" />
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <span className="line-clamp-2 text-[1.65rem] leading-[0.95] font-semibold tracking-tight text-white drop-shadow-sm sm:text-2xl">
          {name}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClassName}>
        {content}
      </button>
    );
  }

  return <div className={baseClassName}>{content}</div>;
}
