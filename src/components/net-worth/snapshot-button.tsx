"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface SnapshotButtonProps {
  onSnapshot: () => Promise<void>;
}

export function SnapshotButton({ onSnapshot }: SnapshotButtonProps) {
  const [loading, setLoading] = useState(false);
  const [hasSnapshotToday, setHasSnapshotToday] = useState(false);

  useEffect(() => {
    const checkToday = async () => {
      try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const res = await fetch(
          `/api/net-worth/snapshots?from=${startOfDay.toISOString()}&to=${endOfDay.toISOString()}`
        );
        if (res.ok) {
          const data = await res.json();
          const snapshots = Array.isArray(data.data) ? data.data : [];
          setHasSnapshotToday(snapshots.length > 0);
        }
      } catch {
        // Ignore errors — button stays enabled
      }
    };
    checkToday();
  }, []);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onSnapshot();
      setHasSnapshotToday(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading || hasSnapshotToday}>
      <Camera className="h-4 w-4 mr-2" />
      {loading ? "Guardando..." : hasSnapshotToday ? "Snapshot tomado" : "Tomar Snapshot"}
    </Button>
  );
}
