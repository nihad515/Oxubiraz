'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Shield, Trash2, ToggleLeft, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { User } from '@/types/auth';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'gold',
  admin: 'warning',
  teacher: 'info',
  student: 'success',
  parent: 'secondary',
};

export default function AdminUsersPage() {
  const { t } = useString();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('filter[search]', search);
      if (roleFilter) params.set('filter[role]', roleFilter);
      const response = await apiClient.axios.get(
        `${API.users.export}?${params}`,
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, roleFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '20' });
      if (search) params.set('filter[search]', search);
      if (roleFilter) params.set('filter[role]', roleFilter);
      return apiClient.get<PaginatedResponse<User[]>>(`${API.users.list}?${params}`);
    },
  });

  const toggleActive = useMutation({
    mutationFn: (userId: number) => apiClient.post(`${API.users.list}/${userId}/toggle-active`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('common.updated', {}, 'Updated'));
    },
  });

  const deleteUser = useMutation({
    mutationFn: (userId: number) => apiClient.delete(`${API.users.list}/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('common.deleted', {}, 'Deleted'));
    },
  });

  const roles = ['', 'super_admin', 'admin', 'teacher', 'student', 'parent'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} />
            {t('nav.users', {}, 'Users')}
          </h1>
          <p className="text-muted-foreground">{t('admin.users_desc', {}, 'Manage all platform users')}</p>
        </div>
        <Button variant="outline" size="sm" loading={exporting} onClick={handleExport}>
          <Download size={16} />
          {t('common.export', {}, 'Export XLSX')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('common.search', {}, 'Search...')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {roles.map((role) => (
                <Button
                  key={role || 'all'}
                  variant={roleFilter === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setRoleFilter(role); setPage(1); }}
                >
                  {role || t('common.all', {}, 'All')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">{t('common.name', {}, 'Name')}</th>
                  <th className="px-4 py-3 font-medium">{t('common.username', {}, 'Username')}</th>
                  <th className="px-4 py-3 font-medium">{t('common.role', {}, 'Role')}</th>
                  <th className="px-4 py-3 font-medium">{t('common.status', {}, 'Status')}</th>
                  <th className="px-4 py-3 font-medium">{t('gamification.level', {}, 'Level')}</th>
                  <th className="px-4 py-3 font-medium">{t('common.actions', {}, 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  data?.data?.map((user: User) => (
                    <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">@{user.username}</td>
                      <td className="px-4 py-3">
                        {user.roles?.map((role) => (
                          <Badge key={role} variant={(ROLE_COLORS[role] as any) ?? 'secondary'} className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.is_active ? 'success' : 'destructive'}>
                          {user.is_active ? t('common.active', {}, 'Active') : t('common.inactive', {}, 'Inactive')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{user.level}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => window.location.href = `/admin/users/${user.id}`}
                            title={t('admin.view_user', {}, 'View User')}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleActive.mutate(user.id)}
                            title={t('common.toggle_active', {}, 'Toggle Active')}
                          >
                            <ToggleLeft size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              if (confirm(t('common.confirm_delete', {}, 'Are you sure?'))) {
                                deleteUser.mutate(user.id);
                              }
                            }}
                            className="text-destructive hover:text-destructive"
                            title={t('common.delete', {}, 'Delete')}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.meta && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-sm text-muted-foreground">
                {t('common.total', {}, 'Total')}: {data.meta.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  {t('common.prev', {}, 'Prev')}
                </Button>
                <span className="flex items-center px-2 text-sm">
                  {page} / {data.meta.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (data.meta.last_page ?? 1)}
                  onClick={() => setPage(p => p + 1)}
                >
                  {t('common.next', {}, 'Next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
