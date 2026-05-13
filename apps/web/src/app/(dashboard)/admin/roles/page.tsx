'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';

interface Role {
  id: number;
  name: string;
  permissions: string[];
  users_count: number;
}

interface PermissionGroup {
  group: string;
  permissions: string[];
}

export default function AdminRolesPage() {
  const { t } = useString();
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [pendingPerms, setPendingPerms] = useState<string[]>([]);

  const { data: roles, isLoading } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => apiClient.get<ApiResponse<Role[]>>(API.roles.list),
    select: (d) => d.data,
  });

  const { data: permGroups } = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => apiClient.get<ApiResponse<PermissionGroup[]>>(API.permissions.list),
    select: (d) => d.data,
  });

  const syncPerms = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) =>
      apiClient.post(`${API.roles.list}/${roleId}/sync-permissions`, { permissions }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      toast.success(t('common.saved', {}, 'Permissions saved'));
      setSelectedRole(null);
    },
  });

  const selectRole = (role: Role) => {
    setSelectedRole(role);
    setPendingPerms([...role.permissions]);
  };

  const togglePerm = (perm: string) => {
    setPendingPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield size={24} />
          {t('nav.roles', {}, 'Roles & Permissions')}
        </h1>
        <p className="text-muted-foreground">{t('admin.roles_desc', {}, 'Configure role-based access control')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles list */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            {t('common.roles', {}, 'Roles')}
          </h2>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          ) : roles?.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedRole?.id === role.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => selectRole(role)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{role.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users size={12} />
                      {role.users_count} {t('nav.users', {}, 'users')}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {role.permissions.length} {t('common.permissions', {}, 'perms')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Permission editor */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('common.permissions_for', {}, 'Permissions for')} {selectedRole.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)}>
                      {t('common.cancel', {}, 'Cancel')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => syncPerms.mutate({ roleId: selectedRole.id, permissions: pendingPerms })}
                      loading={syncPerms.isPending}
                    >
                      {t('common.save', {}, 'Save Changes')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {permGroups?.map(({ group, permissions }) => (
                  <div key={group}>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{group}</div>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map((perm) => {
                        const active = pendingPerms.includes(perm);
                        return (
                          <button
                            key={perm}
                            onClick={() => togglePerm(perm)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                              active
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                            }`}
                          >
                            {perm}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-64">
              <CardContent className="text-center text-muted-foreground">
                <Shield size={40} className="mx-auto mb-3 opacity-20" />
                <p>{t('admin.select_role', {}, 'Select a role to edit permissions')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
