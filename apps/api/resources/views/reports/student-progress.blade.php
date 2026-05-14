<!DOCTYPE html>
<html lang="{{ $lang }}">
<head>
    <meta charset="UTF-8">
    <title>{{ $labels['title'] }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #1e293b;
            background: #ffffff;
        }

        /* ── Header ─────────────────────────────────────── */
        .header {
            background-color: #6d28d9;
            color: #ffffff;
            padding: 28px 40px;
        }
        .header-logo {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.5px;
        }
        .header-sub {
            font-size: 10px;
            color: #e9d5ff;
            margin-top: 4px;
        }

        /* ── Student info ───────────────────────────────── */
        .student-card {
            padding: 20px 40px;
            border-bottom: 2px solid #e2e8f0;
        }
        .student-name { font-size: 18px; font-weight: 700; }
        .student-meta { font-size: 10px; color: #64748b; margin-top: 2px; }

        .badge-wrap { margin-top: 8px; }
        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            margin-right: 6px;
        }
        .badge-level  { background: #ede9fe; color: #7c3aed; }
        .badge-xp     { background: #dbeafe; color: #1d4ed8; }
        .badge-streak { background: #fef3c7; color: #b45309; }

        /* ── Sections ───────────────────────────────────── */
        .section { padding: 18px 40px; }
        .section-title {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 12px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e2e8f0;
        }
        .divider { height: 1px; background: #e2e8f0; margin: 0 40px; }

        /* ── Stat grid (4-col table) ────────────────────── */
        .stat-table { width: 100%; border-collapse: collapse; }
        .stat-table td {
            width: 25%;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            padding: 14px 8px;
            text-align: center;
        }
        .stat-val {
            font-size: 28px;
            font-weight: 900;
            color: #6d28d9;
        }
        .stat-lbl {
            font-size: 9px;
            color: #94a3b8;
            text-transform: uppercase;
            margin-top: 3px;
        }

        /* ── Completion bar ─────────────────────────────── */
        .completion-row {
            margin-top: 14px;
        }
        .completion-label-row {
            font-size: 10px;
            color: #475569;
            margin-bottom: 5px;
        }
        .completion-track {
            width: 100%;
            height: 12px;
            background: #f1f5f9;
            border-radius: 6px;
        }
        .completion-fill {
            height: 12px;
            background-color: #22c55e;
            border-radius: 6px;
        }
        .completion-pct {
            font-size: 11px;
            font-weight: 700;
            color: #16a34a;
            margin-top: 3px;
            text-align: right;
        }

        /* ── Language bar chart ─────────────────────────── */
        .lang-table { width: 100%; border-collapse: collapse; }
        .lang-table td { padding: 4px 0; vertical-align: middle; }
        .lang-label-cell { width: 60px; font-size: 10px; color: #475569; text-align: right; padding-right: 10px; }
        .lang-track-cell { }
        .lang-track {
            width: 100%;
            height: 14px;
            background: #f1f5f9;
            border-radius: 3px;
        }
        .lang-fill {
            height: 14px;
            background-color: #7c3aed;
            border-radius: 3px;
        }
        .lang-val-cell { width: 65px; font-size: 10px; font-weight: 700; color: #7c3aed; padding-left: 8px; }

        /* ── Trend table ────────────────────────────────── */
        .trend-table { width: 100%; border-collapse: collapse; }
        .trend-table th {
            font-size: 9px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            padding: 6px 8px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
        }
        .trend-table td {
            padding: 6px 8px;
            font-size: 11px;
            border-bottom: 1px solid #f1f5f9;
        }
        .trend-table tr:last-child td { border-bottom: none; }
        .td-wpm { font-weight: 700; color: #6d28d9; }
        .td-mode { color: #475569; }
        .td-lang { text-transform: uppercase; color: #64748b; }

        /* ── Footer (fixed) ─────────────────────────────── */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 24px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 4px 40px;
        }
        .footer-left  { float: left;  font-size: 9px; color: #94a3b8; }
        .footer-right { float: right; font-size: 9px; color: #94a3b8; }
    </style>
</head>
<body>

    {{-- Header --}}
    <div class="header">
        <div class="header-logo">Oxubiraz</div>
        <div class="header-sub">{{ $labels['title'] }} &middot; {{ $labels['generated'] }}: {{ $generatedAt }}</div>
    </div>

    {{-- Student info --}}
    <div class="student-card">
        <div class="student-name">{{ $student['name'] }}</div>
        <div class="student-meta">@{{ $student['username'] }}</div>
        <div class="badge-wrap">
            <span class="badge badge-level">{{ $labels['level'] }} {{ $student['level'] }}</span>
            <span class="badge badge-xp">{{ number_format($student['xp']) }} XP</span>
            @if ($student['streak_days'] > 0)
                <span class="badge badge-streak">{{ $student['streak_days'] }}{{ $labels['days'] }}</span>
            @endif
        </div>
    </div>

    {{-- Key stats --}}
    <div class="section">
        <div class="section-title">{{ $labels['performance'] }}</div>
        <table class="stat-table">
            <tr>
                <td>
                    <div class="stat-val">{{ $stats['best_wpm'] }}</div>
                    <div class="stat-lbl">{{ $labels['best_wpm'] }}</div>
                </td>
                <td>
                    <div class="stat-val">{{ $stats['average_wpm'] }}</div>
                    <div class="stat-lbl">{{ $labels['avg_wpm'] }}</div>
                </td>
                <td>
                    <div class="stat-val">{{ number_format($stats['total_words_read']) }}</div>
                    <div class="stat-lbl">{{ $labels['words_read'] }}</div>
                </td>
                <td>
                    <div class="stat-val">{{ $stats['total_sessions'] }}</div>
                    <div class="stat-lbl">{{ $labels['sessions'] }}</div>
                </td>
            </tr>
        </table>

        <div class="completion-row">
            <div class="completion-label-row">{{ $labels['completion_rate'] }}</div>
            <div class="completion-track">
                <div class="completion-fill" style="width: {{ $stats['completion_rate'] }}%"></div>
            </div>
            <div class="completion-pct">{{ $stats['completion_rate'] }}%</div>
        </div>
    </div>

    <div class="divider"></div>

    {{-- Language breakdown --}}
    @if (!empty($byLanguage))
    <div class="section">
        <div class="section-title">{{ $labels['by_language'] }}</div>
        <table class="lang-table">
            @foreach ($byLanguage as $row)
            <tr>
                <td class="lang-label-cell">{{ strtoupper($row['language']) }}</td>
                <td class="lang-track-cell">
                    <div class="lang-track">
                        <div class="lang-fill" style="width: {{ $maxLanguageSessions > 0 ? round(($row['sessions'] / $maxLanguageSessions) * 100) : 0 }}%"></div>
                    </div>
                </td>
                <td class="lang-val-cell">{{ (int) $row['avg_wpm'] }} {{ $labels['wpm'] }}</td>
            </tr>
            @endforeach
        </table>
    </div>
    <div class="divider"></div>
    @endif

    {{-- WPM trend / recent sessions --}}
    @if (!empty($wpmTrend))
    <div class="section">
        <div class="section-title">{{ $labels['recent_sessions'] }}</div>
        <table class="trend-table">
            <thead>
                <tr>
                    <th>{{ $labels['date'] }}</th>
                    <th>{{ $labels['mode'] }}</th>
                    <th>{{ $labels['language'] }}</th>
                    <th>{{ $labels['wpm'] }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($wpmTrend as $row)
                <tr>
                    <td>{{ $row['date'] ?? '—' }}</td>
                    <td class="td-mode">{{ str_replace('_', ' ', $row['mode'] ?? '—') }}</td>
                    <td class="td-lang">{{ strtoupper($row['language'] ?? '—') }}</td>
                    <td class="td-wpm">{{ $row['wpm'] ?? '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    {{-- Page footer --}}
    <div class="footer">
        <span class="footer-left">Oxubiraz &middot; oxubiraz.az</span>
        <span class="footer-right">{{ $labels['generated'] }}: {{ $generatedAt }}</span>
    </div>

</body>
</html>
