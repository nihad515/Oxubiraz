<?php

namespace App\Exports;

use App\Models\SystemString;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SystemStringsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    public function query()
    {
        return SystemString::orderBy('group_name')->orderBy('string_key');
    }

    public function headings(): array
    {
        return ['string_key', 'group_name', 'az', 'ru', 'en', 'description'];
    }

    public function map($string): array
    {
        return [
            $string->string_key,
            $string->group_name,
            $string->az,
            $string->ru,
            $string->en,
            $string->description ?? '',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true, 'size' => 11]]];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 36,
            'B' => 16,
            'C' => 40,
            'D' => 40,
            'E' => 40,
            'F' => 30,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $e) {
                $e->sheet->freezePane('A2');
                $e->sheet->setAutoFilter('A1:F1');
            },
        ];
    }
}
