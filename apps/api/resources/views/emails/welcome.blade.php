@extends('emails.layout')

@section('title', 'Xoş gəldiniz — Oxubiraz')
@section('header_subtitle', 'Oxu. İnkişaf et. Uğur qazan.')

@section('content')
<h2>Xoş gəldiniz, {{ $name }}! 👋</h2>
<p>Oxubiraz platformasına qoşulduğunuz üçün təşəkkür edirik. Hesabınız hazırdır.</p>

<div class="stat-row">
    <div class="stat">
        <div class="value">1</div>
        <div class="label">Səviyyə</div>
    </div>
    <div class="stat">
        <div class="value">0</div>
        <div class="label">XP</div>
    </div>
    <div class="stat">
        <div class="value">0</div>
        <div class="label">Sessiya</div>
    </div>
</div>

<p>İlk oyununuzu oynayın və sürətinizi ölçün:</p>

<p style="text-align:center;">
    <a class="btn" href="{{ $dashboardUrl }}">Platforma daxil ol</a>
</p>

<hr class="divider">

<p style="font-size:13px;color:#888;">Hesab məlumatlarınız:<br>
İstifadəçi adı: <strong>{{ $username }}</strong><br>
Email: <strong>{{ $email }}</strong>
</p>
@endsection
