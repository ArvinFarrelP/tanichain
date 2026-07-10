'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardHeader } from '../../../../components/layout/DashboardHeader';
import { AdminNav } from '../../../../components/layout/AdminNav';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { useRequireAuth } from '../../../../lib/useRequireAuth';
import { apiClient, getApiErrorMessage } from '../../../../lib/api';
import { formatDate } from '../../../../lib/format';
import { ActivityLog, ApiListResponse } from '../../../../types';

export default function AdminActivityPage() {
  const { isReady } = useRequireAuth(['ADMIN']);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    apiClient
      .get<ApiListResponse<ActivityLog>>('/admin/activity-logs', { params: { limit: 100 } })
      .then((res) => setLogs(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isReady]);

  if (!isReady) return null;

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container py-8">
        <div className="mb-2">
          <h1 className="font-display text-2xl font-semibold">Activity Logs</h1>
          <p className="text-sm text-muted-foreground">Audit trail of key actions across the platform.</p>
        </div>
        <AdminNav />

        {loading && <div className="mt-4 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="overflow-x-auto">
          <div className="min-w-[680px] space-y-2">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="flex flex-wrap items-center gap-4 py-3 text-sm">
                  <Badge variant="outline">{log.action.replace(/_/g, ' ')}</Badge>
                  <div className="min-w-[160px] flex-1">
                    <p className="font-medium">{log.user?.fullName ?? 'System'}</p>
                    <p className="text-xs text-muted-foreground">{log.user?.email ?? '—'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
