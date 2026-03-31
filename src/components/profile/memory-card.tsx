import Image from "next/image";
import { Card } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

interface MemoryCardProps {
  image: string;
  description: string;
  userName: string;
  userAvatar?: string;
}

export function MemoryCard({ image, description, userName, userAvatar }: MemoryCardProps) {
  return (
    <Card className="group relative aspect-3/4 overflow-hidden rounded-3xl border-none shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl">
      {/* Background Image */}
      <Image
        src={image}
        alt="Memory"
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
        <p className="line-clamp-3 text-sm font-medium leading-relaxed mb-4">
          &quot;{description}&quot;
        </p>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white/20">
            {userAvatar ? (
              <Image src={userAvatar} alt={userName} width={32} height={32} className="object-cover" />
            ) : (
              <UserCircle className="h-full w-full text-white/50 bg-white/10" />
            )}
          </div>
          <span className="text-sm font-semibold truncate">{userName}</span>
        </div>
      </div>
    </Card>
  );
}
