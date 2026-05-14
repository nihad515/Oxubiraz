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

class GameSessionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    public function __construct(private readonly Collection $sessions) {}

    public function collection(): Collection
    {
        return $this->sessions;
    }

    public function headings(): array
    {
        return ['ID', 'Username', 'Mode', 'Language', 'WPM', 'Words Clicked', 'Total Words', 'Completion %', 'XP Earned', 'Completed', 'Date'];
    }

    public function map($session): array
    {
        return [
            $session->id,
            $session->user?->username ?? '',
            $session->mode,
            strtoupper($session->language),
            $session->wpm,
            $session->clicked_words,
            $session->total_words,
            $session->completion_percentage,
            $session->xp_earned,
            $session->is_completed ? 'Yes' : 'No',
            $session->created_at->toDateTimeString(),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true, 'size' => 11]]];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 20,
            'C' => 18,
            'D' => 10,
            'E' => 8,
            'F' => 14,
            'G' => 13,
            'H' => 14,
            'I' => 10,
            'J' => 10,
            'K' => 22,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $e) {
                $e->sheet->freezePane('A2');
                $e->sheet->setAutoFilter('A1:K1');
            },
        ];
    }
}
