<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AuditLogsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    public function __construct(private readonly Collection $logs) {}

    public function collection(): Collection
    {
        return $this->logs;
    }

    public function headings(): array
    {
        return ['ID', 'Log Name', 'Description', 'Subject Type', 'Subject ID', 'Causer', 'Causer ID', 'Created At'];
    }

    public function map($log): array
    {
        return [
            $log->id,
            $log->log_name,
            $log->description,
            class_basename($log->subject_type ?? ''),
            $log->subject_id,
            $log->causer?->username ?? $log->causer?->email ?? '',
            $log->causer_id,
            $log->created_at->toDateTimeString(),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true, 'size' => 11]]];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10,
            'B' => 16,
            'C' => 40,
            'D' => 16,
            'E' => 12,
            'F' => 22,
            'G' => 12,
            'H' => 22,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $e) {
                $e->sheet->freezePane('A2');
                $e->sheet->setAutoFilter('A1:H1');
            },
        ];
    }
}
