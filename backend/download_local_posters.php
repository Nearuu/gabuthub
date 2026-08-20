<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$postersToDownload = [
    'Queen of Tears' => [
        'file' => 'queen_of_tears.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/8/87/Queen_of_Tears_poster.jpg'
    ],
    'Crash Landing on You' => [
        'file' => 'crash_landing_on_you.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/6/64/Crash_Landing_on_You_main_poster.jpg'
    ],
    'Demon Slayer: Kimetsu no Yaiba' => [
        'file' => 'demon_slayer.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba_anime_poster.jpg'
    ],
    'Frieren: Beyond Journey\'s End' => [
        'file' => 'frieren.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/5/52/Frieren_anime_key_visual.jpg'
    ],
    'Spirited Away' => [
        'file' => 'spirited_away.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/d/db/Spirited_Away_Japanese_poster.png'
    ],
    'Interstellar' => [
        'file' => 'interstellar.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/b/bc/Interstellar_film_poster.jpg'
    ],
    'Inception' => [
        'file' => 'inception.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/7/7f/Inception_ver3.jpg'
    ],
    'Running Man' => [
        'file' => 'running_man.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/a/a2/Running_Man_logo.png'
    ],
    'Knowing Bros' => [
        'file' => 'knowing_bros.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/b/bd/Knowing_Bros_poster.jpg'
    ],
    'Soul Land (Douluo Dalu)' => [
        'file' => 'soul_land.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/en/9/90/Soul_Land_Donghua_Poster.jpg'
    ],
    'Loki' => [
        'file' => 'loki.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/7/78/Loki_season_1_poster.jpg'
    ],
    'Your Name' => [
        'file' => 'your_name.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/0/0b/Your_Name_poster.png'
    ],
    'Jujutsu Kaisen' => [
        'file' => 'jujutsu_kaisen.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/4/46/Jujutsu_kaisen_poster.jpg'
    ],
    'Solo Leveling' => [
        'file' => 'solo_leveling.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/c/c6/Solo_Leveling_anime_poster.jpg'
    ],
    'Weak Hero Class 1' => [
        'file' => 'weak_hero.jpg',
        'url' => 'https://upload.wikimedia.org/wikipedia/id/8/86/Weak_Hero_Class_1_poster.jpg'
    ],
];

$targetDir = 'c:/RavaPendragon/PROJECT ZERO/gabuthub/frontend/public/images/posters/';

foreach ($postersToDownload as $title => $data) {
    $filePath = $targetDir . $data['file'];
    $localUrl = '/images/posters/' . $data['file'];

    // Download image using file_get_contents or curl
    $ctx = stream_context_create(['http' => ['header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n"]]);
    $imgData = @file_get_contents($data['url'], false, $ctx);

    if ($imgData !== false) {
        file_put_contents($filePath, $imgData);
        echo "Downloaded local poster for: {$title}" . PHP_EOL;
    } else {
        echo "Failed to download for: {$title}, fallback to placeholder" . PHP_EOL;
    }

    $content = \App\Models\Content::where('title', $title)->first();
    if ($content) {
        $content->update(['poster_url' => $localUrl]);
        echo "Updated DB poster_url to local: {$localUrl}" . PHP_EOL;
    }
}
