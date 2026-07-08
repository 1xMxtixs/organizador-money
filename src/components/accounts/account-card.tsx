import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountTypeBadge } from "./account-type-badge";
import { formatCurrency } from "@/lib/utils";
import type { AccountType } from "@/lib/validations/account";

interface Account {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string | null;
  balance?: number;
  currencyCode: string;
}

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
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
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(account.balance ?? 0, account.currencyCode)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
