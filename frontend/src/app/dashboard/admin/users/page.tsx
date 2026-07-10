'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2, Search } from 'lucide-react';
import { DashboardHeader } from '../../../../components/layout/DashboardHeader';
import { AdminNav } from '../../../../components/layout/AdminNav';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { useRequireAuth } from '../../../../lib/useRequireAuth';
import { apiClient, downloadFile, getApiErrorMessage } from '../../../../lib/api';
import { formatDate } from '../../../../lib/format';
import { AdminUser, ApiListResponse, Role } from '../../../../types';

const ROLE_OPTIONS: Array<Role | 'ALL'> = ['ALL', 'FARMER', 'BUYER', 'COOPERATIVE', 'ADMIN'];

export default function AdminUsersPage() {
  const { isReady } = useRequireAuth(['ADMIN']);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = () => {
    setLoading(true);
    apiClient
      .get<ApiListResponse<AdminUser>>('/admin/users', {
        params: { search: search || undefined, role: role === 'ALL' ? undefined : role, limit: 100 },
      })
      .then((res) => setUsers(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isReady) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, search, role]);

  const handleToggleActive = async (user: AdminUser) => {
    setSavingId(user.id);
    try {
      await apiClient.patch(`/admin/users/${user.id}`, { isActive: !user.isActive });
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const handleRoleChange = async (user: AdminUser, newRole: Role) => {
    setSavingId(user.id);
    try {
      await apiClient.patch(`/admin/users/${user.id}`, { role: newRole });
      load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/admin/export/users', 'tanichain-users.csv');
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
          <h1 className="font-display text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">All registered accounts on TaniChain.</p>
        </div>
        <AdminNav />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search name or email…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role | 'ALL')}
              className="flex h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r === 'ALL' ? 'All roles' : r}</option>)}
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
          <div className="min-w-[800px] space-y-2">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex flex-wrap items-center gap-4 py-3 text-sm">
                  <div className="min-w-[180px] flex-1">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</span>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                    disabled={savingId === user.id}
                    className="h-8 rounded-md border border-input bg-secondary/40 px-2 text-xs"
                  >
                    {ROLE_OPTIONS.filter((r) => r !== 'ALL').map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <Badge variant={user.wallet?.isFunded ? 'success' : 'secondary'}>
                    {user.wallet ? (user.wallet.isFunded ? 'Wallet funded' : 'Wallet pending') : 'No wallet'}
                  </Badge>
                  <Button
                    variant={user.isActive ? 'outline' : 'destructive'}
                    size="sm"
                    onClick={() => handleToggleActive(user)}
                    disabled={savingId === user.id}
                  >
                    {savingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : user.isActive ? 'Active' : 'Deactivated'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
