"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/services/auth/logout";

export function LogoutButton() {
  return (
    <form action={logoutUser}>
      <Button
        type="submit"
        variant="destructive"
        size="icon"
        className="rounded-2xl bg-red-500/80 backdrop-blur h-10 w-10 hover:bg-red-500 shadow-lg"
      >
        <LogOut className="h-4 w-4 text-white" />
      </Button>
    </form>
  );
}
