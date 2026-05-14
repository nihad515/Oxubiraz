<?php

namespace App\Exports;

use App\Models\WordList;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class WordListExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    public function __construct(private readonly WordList $wordList) {}

    public function query(): Builder
    {
        return $this->wordList->words()->orderBy('frequency', 'desc');
    }

    public function headings(): array
    {
        return ['text', 'syllable_count', 'frequency'];
    }

    public function map($word): array
    {
        return [$word->text, $word->syllable_count, $word->frequency];
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true, 'size' => 11]]];
    }

    public function columnWidths(): array
    {
        return ['A' => 24, 'B' => 16, 'C' => 12];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $e) {
                $e->sheet->freezePane('A2');
                $e->sheet->setAutoFilter('A1:C1');
            },
        ];
    }
}
