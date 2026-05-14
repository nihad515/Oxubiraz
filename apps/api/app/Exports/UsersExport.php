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

class UsersExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    public function __construct(private readonly Collection $users) {}

    public function collection(): Collection
    {
        return $this->users;
    }

    public function headings(): array
    {
        return ['ID', 'Username', 'First Name', 'Last Name', 'Email', 'Role', 'School', 'Level', 'XP', 'Active', 'Joined'];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->username,
            $user->first_name,
            $user->last_name,
            $user->email,
            $user->roles->pluck('name')->join(', '),
            $user->school?->name ?? '',
            $user->level,
            $user->xp,
            $user->is_active ? 'Yes' : 'No',
            $user->created_at->toDateTimeString(),
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
            'D' => 18,
            'E' => 30,
            'F' => 15,
            'G' => 22,
            'H' => 8,
            'I' => 10,
            'J' => 8,
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
