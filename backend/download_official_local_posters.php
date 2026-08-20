<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$officialPosterSources = [
    'Queen of Tears' => [
        'file' => 'queen_of_tears.jpg',
        'urls' => [
            'https://i.pinimg.com/736x/87/42/4f/87424f9273c52e46cb6b38c2317f2231.jpg',
            'https://assets.gqindia.com/photos/65f1295b9c0a6b57db410c5a/master/pass/Queen-of-Tears.jpg'
        ]
    ],
    'Crash Landing on You' => [
        'file' => 'crash_landing_on_you.jpg',
        'urls' => [
            'https://stat2.bollywoodhungama.in/wp-content/uploads/2022/03/Crash-Landing-On-You.jpg',
            'https://asianwiki.com/images/e/e0/Crash_Landing_on_You-P1.jpg'
        ]
    ],
    'Inception' => [
        'file' => 'inception.jpg',
        'urls' => [
            'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
            'https://i.pinimg.com/736x/01/3a/6a/013a6a9b407b8a8b14e6d76bc9bc15f0.jpg'
        ]
    ],
    'Knowing Bros' => [
        'file' => 'knowing_bros.jpg',
        'urls' => [
            'https://i.pinimg.com/736x/91/bf/d7/91bfd72ebf4ed6fef74f07a7df643cfb.jpg',
            'https://asianwiki.com/images/b/bd/Knowing_Bros-p1.jpg'
        ]
    ],
    'Loki' => [
        'file' => 'loki.jpg',
        'urls' => [
            'https://i.pinimg.com/736x/32/23/e8/3223e808c1f03f3fb58e388d75e4e89e.jpg',
            'https://m.media-amazon.com/images/M/MV5BNTkwOTE1ZDYtODQ3Yy00YTYwLTg0YWQtYmJiZTFmOTlhYTdjXkEyXkFqcGc@._V1_.jpg'
        ]
    ],
    'Running Man' => [
        'file' => 'running_man.jpg',
        'urls' => [
            'https://i.pinimg.com/736x/60/79/11/6079116e788e0db43d463d142f1cf88c.jpg',
            'https://asianwiki.com/images/3/3d/Running_Man_SBS-p1.jpg'
        ]
    ],
    'Solo Leveling' => [
        'file' => 'solo_leveling.jpg',
        'urls' => [
            'https://i.pinimg.com/736x/87/ee/b2/87eeb226e64177d612ec9255a6d36329.jpg',
            'https://cdn.myanimelist.net/images/anime/1269/138766.jpg'
        ]
    ],
    'Soul Land (Douluo Dalu)' => [
        'file' => 'soul_land.jpg',
        'urls' => [
            'https://i.pinimg.com/736x/43/46/7d/43467d3e69007f3f1e944414fcfb4632.jpg',
            'https://cdn.myanimelist.net/images/anime/1815/110693.jpg'
        ]
    ],
    'Weak Hero Class 1' => [
        'file' => 'weak_hero.jpg',
        'urls' => [
            'https://i.pinimg.com/736x/86/e1/9b/86e19b55efc71b78ec2dbb3d2bbf180a.jpg',
            'https://asianwiki.com/images/d/d7/Weak_Hero_Class_1-p1.jpg'
        ]
    ]
];

$targetDir = 'c:/RavaPendragon/PROJECT ZERO/gabuthub/frontend/public/images/posters/';

foreach ($officialPosterSources as $title => $data) {
    $filePath = $targetDir . $data['file'];
    $localUrl = '/images/posters/' . $data['file'];

    $downloaded = false;
    foreach ($data['urls'] as $url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $imgBytes = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode == 200 && strlen($imgBytes) > 2000) {
            file_put_contents($filePath, $imgBytes);
            $downloaded = true;
            echo "Downloaded OFFICIAL local poster for: {$title}" . PHP_EOL;
            break;
        }
    }

    if ($downloaded) {
        $content = \App\Models\Content::where('title', $title)->first();
        if ($content) {
            $content->update(['poster_url' => $localUrl]);
            echo "Updated DB to local poster: {$localUrl}" . PHP_EOL;
        }
    }
}
