'use client';

import { useEffect, useState } from 'react';
import { Download, ExternalLink, Loader2, Search } from 'lucide-react';
import { DashboardHeader } from '../../../../components/layout/DashboardHeader';
import { AdminNav } from '../../../../components/layout/AdminNav';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { useRequireAuth } from '../../../../lib/useRequireAuth';
import { apiClient, downloadFile, getApiErrorMessage } from '../../../../lib/api';
import { formatDate, formatXlm, shortHash, shortKey } from '../../../../lib/format';
import { AdminTransaction, ApiListResponse } from '../../../../types';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'SUCCESS', 'FAILED'];

export default function AdminTransactionsPage() {
  const { isReady } = useRequireAuth(['ADMIN']);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    apiClient
      .get<ApiListResponse<AdminTransaction>>('/admin/transactions', {
        params: { search: search || undefined, status: status === 'ALL' ? undefined : status, limit: 100 },
      })
      .then((res) => setTransactions(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isReady, search, status]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/admin/export/transactions', 'tanichain-all-transactions.csv');
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
        <div className="mb-2">
          <h1 className="font-display text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground">Every Stellar Testnet transaction on the platform.</p>
        </div>
        <AdminNav />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by hash or memo…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>)}
            </select>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        </div>

        {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="overflow-x-auto">
          <div className="min-w-[760px] space-y-2">
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
