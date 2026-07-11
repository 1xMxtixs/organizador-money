"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { NetWorthHero } from "@/components/net-worth/net-worth-hero";
import { NetWorthChart } from "@/components/net-worth/net-worth-chart";
import { AssetBreakdown } from "@/components/net-worth/asset-breakdown";
import { LiabilityBreakdown } from "@/components/net-worth/liability-breakdown";
import { SnapshotButton } from "@/components/net-worth/snapshot-button";

interface SummaryData {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetBreakdown: Record<string, number>;
  liabilityBreakdown: Record<string, number>;
}

interface TrendPoint {
  month: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

interface Snapshot {
  id: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  snapshotAt: string;
}

export default function NetWorthPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [summaryRes, trendRes, snapshotsRes] = await Promise.all([
        fetch("/api/net-worth/summary"),
        fetch("/api/net-worth/trend?months=12"),
        fetch("/api/net-worth/snapshots"),
      ]);
      const [summaryJson, trendJson, snapshotsJson] = await Promise.all([
        summaryRes.json(),
        trendRes.json(),
        snapshotsRes.json(),
      ]);
      setSummary(summaryJson.data ?? null);
      setTrend(trendJson.data ?? []);
      setSnapshots(snapshotsJson.data ?? []);
    } catch {
      console.error("Error fetching net worth data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSnapshot = async () => {
    if (!summary) return;
    const res = await fetch("/api/net-worth/snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalAssets: summary.totalAssets,
        totalLiabilities: summary.totalLiabilities,
        netWorth: summary.netWorth,
      }),
    });
    if (res.ok) {
      await loadData();
    }
  };

  const previousNetWorth =
    snapshots.length >= 2 ? snapshots[snapshots.length - 2].netWorth : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patrimonio Neto"
        description="Visualiza tu patrimonio y su evolución"
      >
        <SnapshotButton onSnapshot={handleSnapshot} />
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ) : summary ? (
        <>
          <NetWorthHero
            netWorth={summary.netWorth}
            previousNetWorth={previousNetWorth}
          />

          <NetWorthChart data={trend} />

          <div className="grid gap-4 sm:grid-cols-2">
            <AssetBreakdown breakdown={summary.assetBreakdown} />
            <LiabilityBreakdown breakdown={summary.liabilityBreakdown} />
          </div>
        </>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
}
