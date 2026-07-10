'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck } from 'lucide-react';
import { DashboardHeader } from '../../../components/layout/DashboardHeader';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useRequireAuth } from '../../../lib/useRequireAuth';
import { apiClient, getApiErrorMessage } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { shortKey } from '../../../lib/format';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, isReady } = useRequireAuth();
  const setSession = useAuthStore((s) => s.setSession);
  const token = useAuthStore((s) => s.token);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: user ? { fullName: user.fullName, phone: '' } : undefined,
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  if (!isReady || !user) return null;

  const onSaveProfile = async (values: ProfileForm) => {
    setProfileError(null);
    setProfileMessage(null);
    setProfileLoading(true);
    try {
      const res = await apiClient.patch('/users/profile', values);
      if (token) {
        setSession({ ...user, fullName: res.data.data.fullName }, token);
      }
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setProfileError(getApiErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (values: PasswordForm) => {
    setPasswordError(null);
    setPasswordMessage(null);
    setPasswordLoading(true);
    try {
      await apiClient.patch('/users/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setPasswordMessage('Password changed successfully.');
      passwordForm.reset();
    } catch (err) {
      setPasswordError(getApiErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <DashboardHeader />

      <section className="container max-w-2xl space-y-6 py-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account details and security.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              {user.email} <Badge variant="secondary" className="ml-2">{user.role}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.wallet?.publicKey && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-border/60 bg-secondary/30 px-3 py-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">{shortKey(user.wallet.publicKey)}</span>
                <Badge variant={user.wallet.isFunded ? 'success' : 'warning'} className="ml-auto">
                  {user.wallet.isFunded ? 'Funded' : 'Funding'}
                </Badge>
              </div>
            )}

            <form className="space-y-4" onSubmit={profileForm.handleSubmit(onSaveProfile)}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...profileForm.register('fullName')} />
                {profileForm.formState.errors.fullName && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+62 812 3456 7890" {...profileForm.register('phone')} />
              </div>

              {profileMessage && <p className="text-sm text-primary">{profileMessage}</p>}
              {profileError && <p className="text-sm text-destructive">{profileError}</p>}

              <Button type="submit" disabled={profileLoading}>
                {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Choose a strong password you don&apos;t use elsewhere.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={passwordForm.handleSubmit(onChangePassword)}>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {passwordMessage && <p className="text-sm text-primary">{passwordMessage}</p>}
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Change password
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
