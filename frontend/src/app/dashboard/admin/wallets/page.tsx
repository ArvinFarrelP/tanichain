'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { DashboardHeader } from '../../../../components/layout/DashboardHeader';
import { AdminNav } from '../../../../components/layout/AdminNav';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { useRequireAuth } from '../../../../lib/useRequireAuth';
import { apiClient, getApiErrorMessage } from '../../../../lib/api';
import { shortKey } from '../../../../lib/format';
import { AdminWallet, ApiListResponse } from '../../../../types';

export default function AdminWalletsPage() {
  const { isReady } = useRequireAuth(['ADMIN']);
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    apiClient
      .get<ApiListResponse<AdminWallet>>('/admin/wallets', { params: { limit: 100 } })
      .then((res) => setWallets(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isReady]);

  if (!isReady) return null;

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container py-8">
        <div className="mb-2">
          <h1 className="font-display text-2xl font-semibold">Wallets</h1>
          <p className="text-sm text-muted-foreground">Every Stellar Testnet wallet provisioned by TaniChain.</p>
        </div>
        <AdminNav />

        {loading && <div className="mt-4 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="overflow-x-auto">
          <div className="min-w-[680px] space-y-2">
            {wallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardContent className="flex flex-wrap items-center gap-4 py-3 text-sm">
                  <div className="min-w-[160px] flex-1">
                    <p className="font-medium">{wallet.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{wallet.user.email}</p>
                  </div>
                  <Badge variant="secondary">{wallet.user.role}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{shortKey(wallet.publicKey)}</span>
                  <Badge variant={wallet.isFunded ? 'success' : 'warning'}>{wallet.isFunded ? 'Funded' : 'Funding'}</Badge>
                  <a href={`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon" title="View on Stellar Expert" aria-label="View on Stellar Expert">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
