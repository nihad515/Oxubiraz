<?php

namespace App\Enums;

enum GameMode: string
{
    case RandomWords = 'random_words';
    case TextReading = 'text_reading';
    case SentenceReading = 'sentence_reading';
    case Memory = 'memory';
    case Ai = 'ai';

    public function label(): string
    {
        return match($this) {
            self::RandomWords => 'Random Words',
            self::TextReading => 'Text Reading',
            self::SentenceReading => 'Sentence Reading',
            self::Memory => 'Memory Mode',
            self::Ai => 'AI Mode',
        };
    }
}
