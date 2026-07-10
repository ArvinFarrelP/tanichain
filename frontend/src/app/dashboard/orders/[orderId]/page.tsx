'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, Loader2, QrCode, ShieldCheck } from 'lucide-react';
import { DashboardHeader } from '../../../../components/layout/DashboardHeader';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { useAuthStore } from '../../../../store/authStore';
import { apiClient, downloadFile, getApiErrorMessage } from '../../../../lib/api';
import { formatDate, formatXlm, orderStatusLabels, orderStatusVariant, shortHash, shortKey } from '../../../../lib/format';
import { ApiItemResponse, Order, QrCodeResponse } from '../../../../types';

const STEPS: Array<{ key: string; label: string }> = [
  { key: 'PENDING', label: 'Order placed' },
  { key: 'ESCROW_LOCKED', label: 'Payment committed & escrow locked' },
  { key: 'DELIVERED', label: 'Farmer delivered' },
  { key: 'PAID', label: 'Delivery confirmed & escrow released' },
];

function stepIndex(status: string): number {
  if (status === 'CANCELLED' || status === 'DISPUTED') return -1;
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { user, hydrate, isHydrated } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<QrCodeResponse | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrder = useCallback(() => {
    setLoading(true);
    apiClient
      .get<ApiItemResponse<Order>>(`/orders/${params.orderId}`)
      .then((res) => setOrder(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [params.orderId]);

  useEffect(() => {
    if (isHydrated) loadOrder();
  }, [isHydrated, loadOrder]);

  const runAction = async (action: 'commit' | 'deliver' | 'confirm' | 'cancel') => {
    setActionLoading(true);
    setError(null);
    try {
      await apiClient.post(`/orders/${params.orderId}/${action}`);
      loadOrder();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleQrCode = async () => {
    if (qr) {
      setQr(null);
      return;
    }
    setQrLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ApiItemResponse<QrCodeResponse>>(`/orders/${params.orderId}/qrcode`);
      setQr(res.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setInvoiceLoading(true);
    setError(null);
    try {
      await downloadFile(`/orders/${params.orderId}/invoice`, `invoice-${params.orderId.slice(0, 8)}.pdf`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (!isHydrated || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Link href="/dashboard/orders"><Button variant="outline">Back to orders</Button></Link>
      </main>
    );
  }

  if (!order || !user) return null;

  const isBuyer = order.buyerId === user.id;
  const isFarmer = order.product.farmerId === user.id;
  const currentStep = stepIndex(order.status);

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container max-w-3xl py-8">
        <Link href="/dashboard/orders" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">{order.product.name}</h1>
            <p className="text-sm text-muted-foreground">
              Order #{order.id.slice(0, 8)} · {order.quantity} {order.product.unit} · placed {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge variant={orderStatusVariant(order.status)} className="text-sm">
            {orderStatusLabels[order.status]}
          </Badge>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadInvoice} disabled={invoiceLoading}>
            {invoiceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download Invoice
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={toggleQrCode} disabled={qrLoading}>
            {qrLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
            {qr ? 'Hide QR code' : 'Show payment QR code'}
          </Button>
        </div>

        {qr && (
          <Card className="mb-6">
            <CardContent className="flex flex-col items-center gap-3 py-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr.dataUrl} alt="Stellar payment QR code" className="h-48 w-48 rounded-md bg-white p-2" />
              <p className="max-w-sm break-all text-center font-mono text-xs text-muted-foreground">{qr.uri}</p>
            </CardContent>
          </Card>
        )}

        {/* Workflow progress */}
        {currentStep >= 0 && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                {STEPS.map((step, i) => (
                  <div key={step.key} className="flex flex-1 flex-col items-center gap-2 text-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium ${
                        i <= currentStep
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <p className={`text-xs ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {i < STEPS.length - 1 && (
                      <div className={`hidden h-px w-full sm:block ${i < currentStep ? 'bg-primary/50' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total amount</p>
              <p className="font-display text-lg font-semibold text-primary">{formatXlm(order.totalAmount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Buyer</p>
              <p>{order.buyer.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Farmer</p>
              <p>{order.product.farmer?.fullName ?? '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Delivery confirmed</p>
              <p>{formatDate(order.deliveryConfirmedAt)}</p>
            </div>
          </CardContent>
        </Card>

        {order.paymentCommitment && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle>Payment commitment</CardTitle>
              </div>
              <CardDescription>Escrow-locked funds recorded on Stellar Testnet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyer wallet</span>
                <span className="font-mono">{shortKey(order.paymentCommitment.buyerPublicKey)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Farmer wallet</span>
                <span className="font-mono">{shortKey(order.paymentCommitment.farmerPublicKey)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escrow locked</span>
                <span>{order.paymentCommitment.escrowLocked ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Released at</span>
                <span>{formatDate(order.paymentCommitment.releasedAt)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Blockchain transactions</CardTitle>
            <CardDescription>Every payment event on this order, verifiable on Stellar Expert</CardDescription>
          </CardHeader>
          <CardContent>
            {order.transactions.length === 0 && (
              <p className="text-sm text-muted-foreground">No on-chain transactions yet.</p>
            )}
            <div className="space-y-3">
              {order.transactions.map((tx) => (
                <div key={tx.id} className="ledger-chip flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{tx.type.replace('_', ' ')}</span>
                    <span className="font-mono">{shortHash(tx.stellarTxHash)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{formatXlm(tx.amount)}</span>
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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-3">
          {isBuyer && order.status === 'PENDING' && (
            <>
              <Button onClick={() => runAction('commit')} disabled={actionLoading}>
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Commit Payment (Stellar Testnet)
              </Button>
              <Button variant="outline" onClick={() => runAction('cancel')} disabled={actionLoading}>
                Cancel order
              </Button>
            </>
          )}

          {isFarmer && order.status === 'ESCROW_LOCKED' && (
            <Button onClick={() => runAction('deliver')} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark as delivered
            </Button>
          )}

          {isBuyer && order.status === 'DELIVERED' && (
            <Button onClick={() => runAction('confirm')} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm receipt & release payment
            </Button>
          )}

          {order.status === 'PAID' && (
            <p className="text-sm text-primary">This order is complete. Funds have been released to the farmer.</p>
          )}
        </div>
      </section>
    </main>
  );
}
