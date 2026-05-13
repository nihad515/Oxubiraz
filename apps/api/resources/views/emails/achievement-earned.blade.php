@extends('emails.layout')

@section('title', 'Nailiyyət qazandınız!')
@section('header_subtitle', 'Təbrik edirik!')

@section('content')
<h2>🏆 Nailiyyət qazandınız!</h2>
<p>Salam <strong>{{ $userName }}</strong>, yeni bir nailiyyət əldə etdiniz:</p>

<div class="badge">
    <span class="icon">{{ $icon ?? '🏅' }}</span>
    <span class="label">{{ $achievementName }}</span>
</div>

@if($description)
<p>{{ $description }}</p>
@endif

<div class="stat-row">
    <div class="stat">
        <div class="value">+{{ $xpReward }}</div>
        <div class="label">XP qazandınız</div>
    </div>
</div>

<p style="text-align:center;">
    <a class="btn" href="{{ $dashboardUrl }}/student/achievements">Nailiyyətlərə bax</a>
</p>
@endsection
