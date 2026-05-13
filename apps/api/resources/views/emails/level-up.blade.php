@extends('emails.layout')

@section('title', "Səviyyə {{ $newLevel }}-ə yüksəldiniz!")
@section('header_subtitle', 'Yeni zirvə!')

@section('content')
<h2>⚡ Səviyyə {{ $newLevel }}-ə yüksəldiniz!</h2>
<p>Salam <strong>{{ $userName }}</strong>, zəhmətiniz meyvəsini verdi — yeni səviyyəyə çatdınız!</p>

<div class="badge">
    <span class="icon">⭐</span>
    <span class="label">Səviyyə {{ $newLevel }}</span>
</div>

<div class="stat-row">
    <div class="stat">
        <div class="value">{{ $newLevel }}</div>
        <div class="label">Yeni səviyyə</div>
    </div>
    <div class="stat">
        <div class="value">{{ number_format($xp) }}</div>
        <div class="label">Cəmi XP</div>
    </div>
</div>

<p>Hər yeni səviyyə daha çətin, amma daha maraqlı məzmun açır. Davam edin!</p>

<p style="text-align:center;">
    <a class="btn" href="{{ $dashboardUrl }}">Oynamağa davam et</a>
</p>
@endsection
