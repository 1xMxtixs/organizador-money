import { Badge } from "@/components/ui/badge";
import type { AccountType } from "@/lib/validations/account";

const typeLabels: Record<AccountType, string> = {
  checking: "Cuenta Corriente",
  savings: "Ahorro",
  credit_card: "Tarjeta de Crédito",
  investment: "Inversión",
  cash: "Efectivo",
  loan: "Préstamo",
  real_estate: "Inmueble",
};

const typeColors: Record<AccountType, string> = {
  checking: "bg-blue-100 text-blue-800",
  savings: "bg-green-100 text-green-800",
  credit_card: "bg-red-100 text-red-800",
  investment: "bg-purple-100 text-purple-800",
  cash: "bg-yellow-100 text-yellow-800",
  loan: "bg-orange-100 text-orange-800",
  real_estate: "bg-teal-100 text-teal-800",
};

interface AccountTypeBadgeProps {
  type: AccountType;
}

export function AccountTypeBadge({ type }: AccountTypeBadgeProps) {
  return (
    <Badge variant="outline" className={typeColors[type]}>
      {typeLabels[type]}
    </Badge>
  );
}
