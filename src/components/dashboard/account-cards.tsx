"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountTypeBadge } from "@/components/accounts/account-type-badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/lib/validations/account";

interface Account {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string | null;
  balance?: number;
  currencyCode: string;
  previousBalance?: number;
}

interface AccountCardProps {
  account: Account;
}

function AccountCard({ account }: AccountCardProps) {
  const balance = account.balance ?? 0;
  const previousBalance = account.previousBalance ?? 0;
  const trend = balance - previousBalance;
  const trendPercentage =
    previousBalance !== 0 ? Math.round((trend / Math.abs(previousBalance)) * 100) : 0;

  const TrendIcon =
    trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend > 0
      ? "text-emerald-600"
      : trend < 0
      ? "text-red-600"
      : "text-muted-foreground";

  return (
    <Link href={`/accounts/${account.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{account.name}</CardTitle>
            <AccountTypeBadge type={account.type} />
          </div>
          {account.bankName && (
            <p className="text-sm text-muted-foreground">{account.bankName}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-bold">
            {formatCurrency(balance, account.currencyCode)}
          </p>
          {previousBalance !== 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />
              <span className={cn("font-medium", trendColor)}>
                {trend > 0 ? "+" : ""}{trendPercentage}%
              </span>
              <span>vs mes anterior</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

interface AccountCardsProps {
  accounts: Account[];
}

export function AccountCards({ accounts }: AccountCardsProps) {
  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay cuentas configuradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tus cuentas</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </section>
  );
}