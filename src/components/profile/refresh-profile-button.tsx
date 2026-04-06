"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshProfileButton() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Button
      onClick={handleRefresh}
      variant="outline"
      size="sm"
      className="rounded-xl"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Refresh
    </Button>
  );
}
