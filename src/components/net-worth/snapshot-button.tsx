"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface SnapshotButtonProps {
  onSnapshot: () => Promise<void>;
}

export function SnapshotButton({ onSnapshot }: SnapshotButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onSnapshot();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      <Camera className="h-4 w-4 mr-2" />
      {loading ? "Guardando..." : "Tomar Snapshot"}
    </Button>
  );
}
