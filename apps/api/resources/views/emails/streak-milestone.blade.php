@extends('emails.layout')

@section('title', "{{ $days }} günlük seriya!")
@section('header_subtitle', 'Davamlılığınız mükafatlandırıldı!')

@section('content')
<h2>🔥 {{ $days }} günlük seriya!</h2>
<p>Salam <strong>{{ $userName }}</strong>, {{ $days }} gün ardıcıl olaraq Oxubiraz-da məşq etdiniz. Bu inanılmaz nəticədir!</p>

<div class="stat-row">
    <div class="stat">
        <div class="value">{{ $days }}</div>
        <div class="label">Günlük seriya</div>
    </div>
    <div class="stat">
        <div class="value">+{{ $xpBonus }}</div>
        <div class="label">Bonus XP</div>
    </div>
</div>

<p>Davamlılığınız böyük uğurun açarıdır. Bu tempi saxlayın!</p>

<p style="text-align:center;">
    <a class="btn" href="{{ $dashboardUrl }}">Davam et</a>
</p>
@endsection
