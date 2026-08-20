<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$items = [
    'Queen of Tears' => ['file' => 'queen_of_tears.jpg', 'color' => [236, 72, 153], 'sub' => 'Drakor 2024'],
    'Crash Landing on You' => ['file' => 'crash_landing_on_you.jpg', 'color' => [225, 29, 72], 'sub' => 'Drakor 2019'],
    'Demon Slayer: Kimetsu no Yaiba' => ['file' => 'demon_slayer.jpg', 'color' => [5, 150, 105], 'sub' => 'Anime 2019'],
    'Frieren: Beyond Journey\'s End' => ['file' => 'frieren.jpg', 'color' => [14, 165, 233], 'sub' => 'Anime 2023'],
    'Spirited Away' => ['file' => 'spirited_away.jpg', 'color' => [147, 51, 234], 'sub' => 'Anime 2001'],
    'Interstellar' => ['file' => 'interstellar.jpg', 'color' => [30, 58, 138], 'sub' => 'Movie 2014'],
    'Inception' => ['file' => 'inception.jpg', 'color' => [71, 85, 105], 'sub' => 'Movie 2010'],
    'Running Man' => ['file' => 'running_man.jpg', 'color' => [234, 88, 12], 'sub' => 'Variety 2010'],
    'Knowing Bros' => ['file' => 'knowing_bros.jpg', 'color' => [202, 138, 4], 'sub' => 'Variety 2015'],
    'Soul Land (Douluo Dalu)' => ['file' => 'soul_land.jpg', 'color' => [79, 70, 229], 'sub' => 'Donghua 2018'],
    'Loki' => ['file' => 'loki.jpg', 'color' => [16, 185, 129], 'sub' => 'MCU 2021'],
    'Your Name' => ['file' => 'your_name.jpg', 'color' => [56, 189, 248], 'sub' => 'Anime 2016'],
    'Jujutsu Kaisen' => ['file' => 'jujutsu_kaisen.jpg', 'color' => [220, 38, 38], 'sub' => 'Anime 2020'],
    'Solo Leveling' => ['file' => 'solo_leveling.jpg', 'color' => [99, 102, 241], 'sub' => 'Anime 2024'],
    'Weak Hero Class 1' => ['file' => 'weak_hero.jpg', 'color' => [180, 83, 9], 'sub' => 'Drama 2022'],
];

$targetDir = 'c:/RavaPendragon/PROJECT ZERO/gabuthub/frontend/public/images/posters/';

foreach ($items as $title => $info) {
    $filePath = $targetDir . $info['file'];
    $localUrl = '/images/posters/' . $info['file'];

    // Generate clean HD poster image if file not downloaded
    if (!file_exists($filePath) || filesize($filePath) < 500) {
        $im = imagecreatetruecolor(600, 900);
        $bg = imagecolorallocate($im, $info['color'][0], $info['color'][1], $info['color'][2]);
        $dark = imagecolorallocate($im, 15, 23, 42);
        $white = imagecolorallocate($im, 255, 255, 255);
        $mint = imagecolorallocate($im, 0, 229, 117);

        // Gradient
        imagefill($im, 0, 0, $dark);
        for ($y = 0; $y < 900; $y++) {
            $alpha = $y / 900;
            $r = (int)($info['color'][0] * (1 - $alpha) + 15 * $alpha);
            $g = (int)($info['color'][1] * (1 - $alpha) + 23 * $alpha);
            $b = (int)($info['color'][2] * (1 - $alpha) + 42 * $alpha);
            $col = imagecolorallocate($im, $r, $g, $b);
            imageline($im, 0, $y, 600, $y, $col);
        }

        // Draw title string text
        imagestring($im, 5, 40, 420, strtoupper($title), $white);
        imagestring($im, 4, 40, 460, $info['sub'], $mint);
        imagestring($im, 3, 40, 840, "GABUTHUB EXCLUSIVE", $white);

        imagejpeg($im, $filePath, 90);
        imagedestroy($im);
        echo "Generated HD local poster for: {$title}" . PHP_EOL;
    }

    $content = \App\Models\Content::where('title', $title)->first();
    if ($content) {
        $content->update(['poster_url' => $localUrl]);
        echo "Updated DB poster_url to local: {$localUrl}" . PHP_EOL;
    }
}
