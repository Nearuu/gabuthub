<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tmdbPosters = [
    'Queen of Tears' => [
        'file' => 'queen_of_tears.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/v9Q61C88Vq1oGfQoPZ3K8M0Jv8z.jpg'
    ],
    'Crash Landing on You' => [
        'file' => 'crash_landing_on_you.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/vNWG7mkyD7zW9TfJ36kP0Bq33V4.jpg'
    ],
    'Demon Slayer: Kimetsu no Yaiba' => [
        'file' => 'demon_slayer.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/xUfRSt82JRfuFi9v2g9B80628p0.jpg'
    ],
    'Frieren: Beyond Journey\'s End' => [
        'file' => 'frieren.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/dqZENchT74fTf1pX0S9nF1836N.jpg'
    ],
    'Spirited Away' => [
        'file' => 'spirited_away.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/39392Vft6W97R91w2h72vP75B9.jpg'
    ],
    'Interstellar' => [
        'file' => 'interstellar.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
    ],
    'Inception' => [
        'file' => 'inception.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/oYuLEW9W2vBBGLdu2qMVyZ9cAU.jpg'
    ],
    'Running Man' => [
        'file' => 'running_man.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/yA20wWJ1v8T6kS8P2q2F1P2K1N3.jpg'
    ],
    'Knowing Bros' => [
        'file' => 'knowing_bros.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/6h49s13x9P2q2F1P2K1N3O3P9Z.jpg'
    ],
    'Soul Land (Douluo Dalu)' => [
        'file' => 'soul_land.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/3vA0g2B1Y6kS8P2q2F1P2K1N3.jpg'
    ],
    'Loki' => [
        'file' => 'loki.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/voHU17yYyoXD2wJ2qj123yX31y.jpg'
    ],
    'Your Name' => [
        'file' => 'your_name.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/q715Ki9j6hTsT2z91z3yX31y.jpg'
    ],
    'Jujutsu Kaisen' => [
        'file' => 'jujutsu_kaisen.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/eFiB78p3b3Z5T4p70S9nF1836N.jpg'
    ],
    'Solo Leveling' => [
        'file' => 'solo_leveling.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/gV123456789.jpg'
    ],
    'Weak Hero Class 1' => [
        'file' => 'weak_hero.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/w123456789.jpg'
    ],
];

$targetDir = 'c:/RavaPendragon/PROJECT ZERO/gabuthub/frontend/public/images/posters/';

foreach ($tmdbPosters as $title => $info) {
    $filePath = $targetDir . $info['file'];
    $localUrl = '/images/posters/' . $info['file'];

    $ch = curl_init($info['url']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $data = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode == 200 && strlen($data) > 1000) {
        file_put_contents($filePath, $data);
        echo "TMDB Downloaded local poster: {$info['file']}" . PHP_EOL;
    } else {
        echo "HTTP {$httpCode} for TMDB {$title}" . PHP_EOL;
    }

    $content = \App\Models\Content::where('title', $title)->first();
    if ($content) {
        $content->update(['poster_url' => $localUrl]);
        echo "Updated DB poster_url to: {$localUrl}" . PHP_EOL;
    }
}
