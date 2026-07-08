"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createCategorySchema,
  type CategoryType,
  type CreateCategoryInput,
} from "@/lib/validations/category";

const categoryTypes: { value: CategoryType; label: string }[] = [
  { value: "expense", label: "Gasto" },
  { value: "income", label: "Ingreso" },
  { value: "saving", label: "Ahorro" },
  { value: "investment", label: "Inversión" },
];

const presetColors = [
  "#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899",
  "#10B981", "#6366F1", "#F97316", "#6B7280", "#D946EF",
  "#14B8A6", "#F43F5E",
];

const presetIcons = [
  "🍔", "🏠", "🚗", "🎭", "👕", "💊", "📚", "💳", "🎁",
  "💼", "💰", "📈", "🏦", "📊", "🐕", "✈️", "🎵", "📱",
  "☕", "🏋️", "🎬", "💡", "🔧", "🎨",
];

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
  initialData?: {
    name?: string;
    icon?: string;
    color?: string;
    type?: CategoryType;
    cashflowDirection?: "inflow" | "outflow";
  };
  mode?: "create" | "edit";
}

export function CategoryForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? "🎁");
  const [color, setColor] = useState(initialData?.color ?? "#6B7280");
  const [type, setType] = useState<CategoryType>(initialData?.type ?? "expense");
  const [cashflowDirection, setCashflowDirection] = useState<"inflow" | "outflow">(
    initialData?.cashflowDirection ?? (initialData?.type === "income" ? "inflow" : "outflow"),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (newType: CategoryType) => {
    setType(newType);
    if (newType === "income") {
      setCashflowDirection("inflow");
    } else {
      setCashflowDirection("outflow");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createCategorySchema.safeParse({ name, icon, color, type, cashflowDirection });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(result.data);
      onOpenChange(false);
      setName("");
      setIcon("🎁");
      setColor("#6B7280");
      setType("expense");
      setCashflowDirection("outflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva Categoría" : "Editar Categoría"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Ícono</Label>
            <div className="flex flex-wrap gap-2">
              {presetIcons.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`h-8 w-8 rounded-md flex items-center justify-center text-lg transition-colors ${
                    icon === emoji
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => setIcon(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-6 w-6 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-6 w-6 rounded-full cursor-pointer border-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mascotas"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => handleTypeChange(v as CategoryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {mode === "create" ? "Crear Categoría" : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
