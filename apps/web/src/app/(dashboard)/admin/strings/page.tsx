'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Search, Save, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { SystemString } from '@/types/strings';
import type { ApiResponse } from '@/types/api';

export default function AdminStringsPage() {
  const { t } = useString();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const { data: groups } = useQuery({
    queryKey: ['strings', 'groups'],
    queryFn: () => apiClient.get<ApiResponse<string[]>>(API.strings.groups),
    select: (d) => d.data,
  });

  const { data: strings, isLoading } = useQuery({
    queryKey: ['strings', 'list', search, groupFilter],
    queryFn: () => {
      const params = new URLSearchParams({ per_page: '100' });
      if (search) params.set('filter[search]', search);
      if (groupFilter) params.set('filter[group_name]', groupFilter);
      return apiClient.get<ApiResponse<SystemString[]>>(`${API.strings.list}?${params}`);
    },
    select: (d) => d.data,
  });

  const updateString = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SystemString> }) =>
      apiClient.patch(`${API.strings.list}/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['strings'] });
      toast.success(t('common.saved', {}, 'Saved'));
      setEditingId(null);
      setEditValues({});
    },
  });

  const startEdit = (s: SystemString) => {
    setEditingId(s.id);
    setEditValues({ az: s.az, ru: s.ru, en: s.en });
  };

  const saveEdit = (id: number) => {
    updateString.mutate({ id, data: editValues });
  };

  const locales = ['az', 'ru', 'en'] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText size={24} />
            {t('nav.strings', {}, 'String Management')}
          </h1>
          <p className="text-muted-foreground">{t('admin.strings_desc', {}, 'Manage all UI text and translations')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(API.strings.export, '_blank')}
          >
            <Download size={16} />
            {t('common.export', {}, 'Export CSV')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('common.search', {}, 'Search by key or value...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={groupFilter === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupFilter('')}
              >
                {t('common.all', {}, 'All')}
              </Button>
              {groups?.map((group) => (
                <Button
                  key={group}
                  variant={groupFilter === group ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupFilter(group)}
                >
                  {group}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strings table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium w-48">{t('common.key', {}, 'Key')}</th>
                  <th className="px-4 py-3 font-medium w-24">{t('common.group', {}, 'Group')}</th>
                  {locales.map((locale) => (
                    <th key={locale} className="px-4 py-3 font-medium">{locale.toUpperCase()}</th>
                  ))}
                  <th className="px-4 py-3 font-medium w-24">{t('common.actions', {}, 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : strings?.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.string_key}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">{s.group_name}</Badge>
                    </td>
                    {locales.map((locale) => (
                      <td key={locale} className="px-4 py-3 max-w-[200px]">
                        {editingId === s.id ? (
                          <Input
                            value={editValues[locale] ?? ''}
                            onChange={(e) => setEditValues(prev => ({ ...prev, [locale]: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        ) : (
                          <span className="text-xs line-clamp-2">{s[locale]}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {editingId === s.id ? (
                        <div className="flex gap-1">
                          <Button size="icon-sm" onClick={() => saveEdit(s.id)} loading={updateString.isPending}>
                            <Save size={14} />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => startEdit(s)}>
                          {t('common.edit', {}, 'Edit')}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
