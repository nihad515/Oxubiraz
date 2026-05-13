<?php

namespace Database\Seeders;

use App\Models\Word;
use App\Models\WordList;
use Illuminate\Database\Seeder;

class WordListSeeder extends Seeder
{
    public function run(): void
    {
        $lists = [
            [
                'list' => [
                    'name' => 'Azərbaycan dili — Başlanğıc',
                    'language' => 'az',
                    'difficulty' => 'beginner',
                    'age_group' => '5-7',
                    'is_active' => true,
                ],
                'words' => [
                    'alma', 'kitab', 'ev', 'su', 'hava', 'günəş', 'ay', 'ulduz',
                    'at', 'it', 'pişik', 'quş', 'balıq', 'çiçək', 'ağac', 'yol',
                    'dağ', 'dəniz', 'çay', 'göl', 'torpaq', 'daş', 'od', 'rəng',
                    'qırmızı', 'sarı', 'yaşıl', 'mavi', 'ağ', 'qara', 'böyük', 'kiçik',
                    'yaxşı', 'pis', 'gözəl', 'yeni', 'köhnə', 'sürətli', 'yavaş', 'şirin',
                    'ana', 'ata', 'bacı', 'qardaş', 'dost', 'uşaq', 'qız', 'oğlan',
                ],
            ],
            [
                'list' => [
                    'name' => 'Azərbaycan dili — Orta',
                    'language' => 'az',
                    'difficulty' => 'intermediate',
                    'age_group' => '8-10',
                    'is_active' => true,
                ],
                'words' => [
                    'mədəniyyət', 'cəmiyyət', 'iqtisadiyyat', 'siyasət', 'tarix', 'coğrafiya',
                    'riyaziyyat', 'fizika', 'kimya', 'biologiya', 'ədəbiyyat', 'incəsənət',
                    'müstəqillik', 'azadlıq', 'hüquq', 'vəzifə', 'məsuliyyət', 'xidmət',
                    'inkişaf', 'tərəqqi', 'nailiyyət', 'uğur', 'müvəffəqiyyət', 'qələbə',
                    'mübarizə', 'çalışmaq', 'öyrənmək', 'anlamaq', 'düşünmək', 'yaratmaq',
                ],
            ],
            [
                'list' => [
                    'name' => 'English — Beginner',
                    'language' => 'en',
                    'difficulty' => 'beginner',
                    'age_group' => '8-10',
                    'is_active' => true,
                ],
                'words' => [
                    'the', 'and', 'is', 'in', 'it', 'you', 'that', 'he', 'she', 'was',
                    'for', 'on', 'are', 'with', 'as', 'at', 'be', 'this', 'have', 'from',
                    'cat', 'dog', 'sun', 'moon', 'tree', 'book', 'home', 'school', 'water', 'food',
                    'run', 'jump', 'play', 'read', 'write', 'sing', 'dance', 'eat', 'sleep', 'walk',
                    'big', 'small', 'fast', 'slow', 'good', 'bad', 'happy', 'sad', 'new', 'old',
                ],
            ],
            [
                'list' => [
                    'name' => 'Русский язык — Начальный',
                    'language' => 'ru',
                    'difficulty' => 'beginner',
                    'age_group' => '8-10',
                    'is_active' => true,
                ],
                'words' => [
                    'кот', 'дом', 'мама', 'папа', 'вода', 'хлеб', 'школа', 'книга', 'друг', 'солнце',
                    'небо', 'земля', 'дерево', 'цветок', 'птица', 'рыба', 'гора', 'река', 'море', 'лес',
                    'читать', 'писать', 'учиться', 'играть', 'бегать', 'прыгать', 'петь', 'рисовать',
                    'большой', 'маленький', 'быстрый', 'медленный', 'хороший', 'плохой', 'новый', 'старый',
                ],
            ],
        ];

        foreach ($lists as $item) {
            $wordList = WordList::updateOrCreate(['name' => $item['list']['name']], $item['list']);

            $words = collect($item['words'])->map(fn ($text, $i) => [
                'word_list_id' => $wordList->id,
                'text' => $text,
                'syllable_count' => mb_strlen($text) > 5 ? 3 : (mb_strlen($text) > 3 ? 2 : 1),
                'frequency' => count($item['words']) - $i,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Only insert new words
            $existing = Word::where('word_list_id', $wordList->id)->pluck('text')->toArray();
            $newWords = $words->filter(fn ($w) => !in_array($w['text'], $existing, true));

            if ($newWords->isNotEmpty()) {
                Word::insert($newWords->toArray());
            }
        }
    }
}
