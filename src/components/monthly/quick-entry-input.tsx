"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2Icon } from "lucide-react";
import type { QuickEntryInputProps } from "@/types/monthly";

export function QuickEntryInput({ onSubmit, disabled }: QuickEntryInputProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) return;

    setLoading(true);
    try {
      await onSubmit(parsed);
      setValue("");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="relative w-28 shrink-0">
      <Input
        ref={inputRef}
        type="number"
        min="0"
        step="any"
        placeholder="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        onBlur={() => {
          if (value) handleSubmit();
        }}
        disabled={disabled || loading}
        className="h-8 text-right tabular-nums pr-7"
      />
      {loading && (
        <Loader2Icon className="absolute right-2 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
