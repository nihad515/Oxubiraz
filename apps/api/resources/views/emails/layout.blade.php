<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@yield('title', 'Oxubiraz')</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f4f4f7; color: #333; }
        .wrapper { max-width: 600px; margin: 40px auto; padding: 0 16px; }
        .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; }
        .header img { height: 40px; margin-bottom: 12px; }
        .header h1 { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
        .header p { color: rgba(255,255,255,.8); font-size: 14px; margin-top: 4px; }
        .body { padding: 32px; }
        .body h2 { font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px; }
        .body p { font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 16px; }
        .btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: #f3f0ff; border: 1px solid #e0d9ff; border-radius: 50px; padding: 10px 20px; margin: 16px 0; }
        .badge .icon { font-size: 28px; }
        .badge .label { font-size: 16px; font-weight: 700; color: #6366f1; }
        .stat-row { display: flex; gap: 12px; margin: 16px 0; }
        .stat { flex: 1; background: #f8f8fc; border-radius: 8px; padding: 14px; text-align: center; }
        .stat .value { font-size: 24px; font-weight: 800; color: #6366f1; }
        .stat .label { font-size: 12px; color: #888; margin-top: 2px; }
        .divider { border: none; border-top: 1px solid #f0f0f4; margin: 24px 0; }
        .footer { padding: 24px 32px; background: #f8f8fc; text-align: center; }
        .footer p { font-size: 12px; color: #aaa; line-height: 1.6; }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="card">
        <div class="header">
            <h1>📖 Oxubiraz</h1>
            <p>@yield('header_subtitle', 'Oxu. İnkişaf et. Uğur qazan.')</p>
        </div>
        <div class="body">
            @yield('content')
        </div>
        <div class="footer">
            <p>Bu email <strong>Oxubiraz</strong> platformasından göndərilib.<br>
            <a href="{{ config('app.frontend_url', 'https://oxubiraz.az') }}">oxubiraz.az</a> &middot;
            Sorğularınız üçün: <a href="mailto:support@oxubiraz.az">support@oxubiraz.az</a></p>
        </div>
    </div>
</div>
</body>
</html>
