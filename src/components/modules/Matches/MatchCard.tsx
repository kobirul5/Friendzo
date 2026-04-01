import React from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

interface MatchCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string | null;
    dob: string | number;
    address: string;
    interestPercentage: number;
    distanceKm: number;
  };
}

export const MatchCard: React.FC<MatchCardProps> = ({ user }) => {
  const age = typeof user.dob === "string" 
    ? new Date().getFullYear() - new Date(user.dob).getFullYear()
    : user.dob > 0 
      ? new Date().getFullYear() - new Date(user.dob).getFullYear()
      : 21; // fallback

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] border-4 border-primary/40 bg-muted/20 shadow-xl transition-transform hover:-translate-y-1">
      {/* Background Image */}
      {user.profileImage ? (
        <Image
          src={user.profileImage}
          alt={`${user.firstName} ${user.lastName}`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/10">
           <span className="text-4xl font-bold text-primary/20">{user.firstName[0]}</span>
        </div>
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Match Percentage (Top Left) */}
      <div className="absolute left-4 top-4">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
            <circle
              className="text-white/20"
              strokeWidth="3"
              stroke="currentColor"
              fill="transparent"
              r="16"
              cx="18"
              cy="18"
            />
            <circle
              className="text-primary"
              strokeWidth="3"
              strokeDasharray="100"
              strokeDashoffset={100 - user.interestPercentage}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="16"
              cx="18"
              cy="18"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-white">
            {user.interestPercentage}%
          </span>
        </div>
      </div>

      {/* Content (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 p-6 text-center text-white">
        <div className="mb-2 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[10px] font-medium backdrop-blur-md">
          {user.distanceKm.toFixed(1)} km away
        </div>
        
        <div className="flex items-center justify-center gap-2">
           <h3 className="text-xl font-bold">
            {user.firstName}, {age}
          </h3>
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
        
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-80">
          {user.address.split(",")[0] || "HANOVER"}
        </p>
      </div>
    </div>
  );
};
