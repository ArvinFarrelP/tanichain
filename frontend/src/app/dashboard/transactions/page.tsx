'use client';

import { useEffect, useState } from 'react';
import { Download, ExternalLink, Loader2, Receipt, Search } from 'lucide-react';
import { DashboardHeader } from '../../../components/layout/DashboardHeader';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { ListSkeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { useRequireAuth } from '../../../lib/useRequireAuth';
import { apiClient, downloadFile, getApiErrorMessage } from '../../../lib/api';
import { formatDate, formatXlm, shortHash, shortKey } from '../../../lib/format';
import { ApiListResponse, Transaction } from '../../../types';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'SUCCESS', 'FAILED'];

export default function TransactionsPage() {
  const { isReady } = useRequireAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const controller = new AbortController();
    setLoading(true);
    apiClient
      .get<ApiListResponse<Transaction>>('/transactions', {
        params: { search: search || undefined, status: status === 'ALL' ? undefined : status, limit: 50 },
        signal: controller.signal,
      })
      .then((res) => setTransactions(res.data.data))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(err));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [isReady, search, status]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/transactions/export', 'tanichain-transactions.csv');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  if (!isReady) return null;

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Transaction History</h1>
            <p className="text-sm text-muted-foreground">Every Stellar Testnet transaction tied to your wallet.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by hash or memo…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>
            ))}
          </select>
        </div>

        {loading && <ListSkeleton rows={5} />}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && transactions.length === 0 && (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            description="Once you commit a payment or receive one, your Stellar Testnet transactions will appear here."
          />
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[720px] space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{tx.type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {shortKey(tx.senderPublicKey)} → {shortKey(tx.receiverPublicKey)}
                  </div>
                  <div className="font-mono text-xs">{shortHash(tx.stellarTxHash)}</div>
                  <div className="font-display font-semibold text-primary">{formatXlm(tx.amount)}</div>
                  <Badge variant={tx.status === 'SUCCESS' ? 'success' : tx.status === 'FAILED' ? 'destructive' : 'warning'}>
                    {tx.status}
                  </Badge>
                  {tx.explorerUrl && (
                    <a href={tx.explorerUrl} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" title="View on Stellar Expert" aria-label="View on Stellar Expert">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
