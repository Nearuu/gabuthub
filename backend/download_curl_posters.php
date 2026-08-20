<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$items = [
    'Queen of Tears' => [
        'file' => 'queen_of_tears.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/v9Q61C88Vq1oGfQoPZ3K8M0Jv8z.jpg'
    ],
    'Crash Landing on You' => [
        'file' => 'crash_landing_on_you.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/9b2N3eXh2P9q2F1P2K1N3O3P9Z.jpg'
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
        'url' => 'https://image.tmdb.org/t/p/w500/g7Fw2gJ35hGZqV810Yq8yZ3yX3y.jpg'
    ],
    'Knowing Bros' => [
        'file' => 'knowing_bros.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/z6h49s13x9P2q2F1P2K1N3O3P9Z.jpg'
    ],
    'Soul Land (Douluo Dalu)' => [
        'file' => 'soul_land.jpg',
        'url' => 'https://image.tmdb.org/t/p/w500/8c8q9v9Z2P9q2F1P2K1N3O3P9Z.jpg'
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
        'url' => 'https://image.tmdb.org/t/p/w500/hEStructure123456789.jpg'
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

// Reliable direct image download list
$directUrls = [
    'Queen of Tears' => 'https://upload.wikimedia.org/wikipedia/en/8/87/Queen_of_Tears_poster.jpg',
    'Crash Landing on You' => 'https://upload.wikimedia.org/wikipedia/en/6/64/Crash_Landing_on_You_main_poster.jpg',
    'Demon Slayer: Kimetsu no Yaiba' => 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba_anime_poster.jpg',
    'Frieren: Beyond Journey\'s End' => 'https://upload.wikimedia.org/wikipedia/en/5/52/Frieren_anime_key_visual.jpg',
    'Spirited Away' => 'https://upload.wikimedia.org/wikipedia/en/d/db/Spirited_Away_Japanese_poster.png',
    'Interstellar' => 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
    'Inception' => 'https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg',
    'Running Man' => 'https://upload.wikimedia.org/wikipedia/en/a/a2/Running_Man_logo.png',
    'Knowing Bros' => 'https://upload.wikimedia.org/wikipedia/en/b/bd/Knowing_Bros_poster.jpg',
    'Soul Land (Douluo Dalu)' => 'https://upload.wikimedia.org/wikipedia/en/9/90/Soul_Land_Donghua_Poster.jpg',
    'Loki' => 'https://upload.wikimedia.org/wikipedia/en/7/78/Loki_season_1_poster.jpg',
    'Your Name' => 'https://upload.wikimedia.org/wikipedia/en/0/0b/Your_Name_poster.png',
    'Jujutsu Kaisen' => 'https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_kaisen_poster.jpg',
    'Solo Leveling' => 'https://upload.wikimedia.org/wikipedia/en/c/c6/Solo_Leveling_anime_poster.jpg',
    'Weak Hero Class 1' => 'https://upload.wikimedia.org/wikipedia/en/8/86/Weak_Hero_Class_1_poster.jpg',
];

foreach ($items as $title => $info) {
    $filePath = $targetDir . $info['file'];
    $localUrl = '/images/posters/' . $info['file'];
    $remoteUrl = $directUrls[$title];

    $ch = curl_init($remoteUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $data = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode == 200 && strlen($data) > 1000) {
        file_put_contents($filePath, $data);
        echo "Successfully downloaded local file: {$info['file']}" . PHP_EOL;
    } else {
        echo "HTTP {$httpCode} for {$title}" . PHP_EOL;
    }

    $content = \App\Models\Content::where('title', $title)->first();
    if ($content) {
        $content->update(['poster_url' => $localUrl]);
        echo "Updated DB poster_url to: {$localUrl}" . PHP_EOL;
    }
}
