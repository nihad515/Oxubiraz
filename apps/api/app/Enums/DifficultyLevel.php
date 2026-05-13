<?php

namespace App\Enums;

enum DifficultyLevel: string
{
    case Beginner = 'beginner';
    case Elementary = 'elementary';
    case Intermediate = 'intermediate';
    case Advanced = 'advanced';
    case Expert = 'expert';
}
