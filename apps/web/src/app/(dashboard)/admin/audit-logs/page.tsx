'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Search, Download } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { formatDateTime } from '@/lib/utils/format';
import type { PaginatedResponse } from '@/types/api';

interface AuditLog {
  id: number;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: number | null;
  causer: { id: number; first_name: string; last_name: string; username: string } | null;
  properties: Record<string, any>;
  created_at: string;
}

const logColors: Record<string, string> = {
  created: 'success',
  updated: 'warning',
  deleted: 'destructive',
  default: 'secondary',
};

export default function AdminAuditLogsPage() {
  const { t } = useString();
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      const response = await apiClient.axios.get(
        `${API.auditLogs.export}?${params}`,
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', page, dateFrom, dateTo],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '20' });
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      return apiClient.get<PaginatedResponse<AuditLog[]>>(`${API.auditLogs.list}?${params}`);
    },
  });

  const subjectLabel = (type: string) => type.split('\\').pop() ?? type;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList size={24} />
            {t('nav.audit_logs', {}, 'Audit Logs')}
          </h1>
          <p className="text-muted-foreground">{t('admin.audit_logs_desc', {}, 'Track all platform activity and changes')}</p>
        </div>
        <Button variant="outline" size="sm" loading={exporting} onClick={handleExport}>
          <Download size={16} />
          {t('common.export', {}, 'Export XLSX')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t('common.date_from', {}, 'From')}</label>
              <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="w-40" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t('common.date_to', {}, 'To')}</label>
              <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="w-40" />
            </div>
            {(dateFrom || dateTo) && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}>
                  {t('common.clear', {}, 'Clear')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : !data?.data?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
              <p>{t('admin.no_logs', {}, 'No audit logs found.')}</p>
            </CardContent>
          </Card>
        ) : (
          data.data.map((log: AuditLog) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={(logColors[log.description] as any) ?? 'secondary'} className="text-xs capitalize">
                        {log.description}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono">
                        {subjectLabel(log.subject_type)}#{log.subject_id}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm">
                      {log.causer ? (
                        <span className="font-medium">{log.causer.first_name} {log.causer.last_name}</span>
                      ) : (
                        <span className="text-muted-foreground">{t('common.system', {}, 'System')}</span>
                      )}
                      {' — '}
                      <span className="text-muted-foreground">{log.log_name}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">{formatDateTime(log.created_at)}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('common.total', {}, 'Total')}: {data.meta.total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('common.prev', {}, 'Prev')}</Button>
            <span className="flex items-center px-2 text-sm">{page} / {data.meta.last_page}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.last_page} onClick={() => setPage(p => p + 1)}>{t('common.next', {}, 'Next')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
