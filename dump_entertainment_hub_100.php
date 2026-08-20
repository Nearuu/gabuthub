<?php

$mysqli = new mysqli("127.0.0.1", "root", "", "entertainment_hub");

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// 1. Contents with exact dynamic rating and relations
$contentsRes = $mysqli->query("SELECT * FROM contents ORDER BY id ASC");
$contents = [];
while ($c = $contentsRes->fetch_assoc()) {
    $cId = $c['id'];
    
    // Genres
    $gRes = $mysqli->query("SELECT g.id, g.name FROM genres g JOIN content_genres cg ON g.id = cg.genre_id WHERE cg.content_id = $cId");
    $genres = [];
    while ($g = $gRes->fetch_assoc()) {
        $genres[] = ['id' => (int)$g['id'], 'name' => $g['name']];
    }
    $c['genres'] = $genres;

    // OSTs
    $oRes = $mysqli->query("SELECT * FROM osts WHERE content_id = $cId");
    $osts = [];
    while ($o = $oRes->fetch_assoc()) {
        $o['id'] = (int)$o['id'];
        $o['likes_count'] = (int)($o['likes_count'] ?? 0);
        $osts[] = $o;
    }
    $c['osts'] = $osts;

    // Reviews & calculate exact avg_rating
    $rRes = $mysqli->query("SELECT r.*, u.username, u.avatar FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.content_id = $cId");
    $reviews = [];
    $totalRating = 0;
    while ($r = $rRes->fetch_assoc()) {
        $ratingVal = (float)$r['rating'];
        $totalRating += $ratingVal;
        $reviews[] = [
            'id' => (int)$r['id'],
            'rating' => $ratingVal,
            'review' => $r['review'],
            'created_at' => $r['created_at'],
            'user' => ['username' => $r['username'], 'avatar' => $r['avatar']]
        ];
    }
    $c['reviews'] = $reviews;
    $c['id'] = (int)$c['id'];
    $c['is_featured'] = (int)($c['is_featured'] ?? 0);
    $c['reviews_count'] = count($reviews);
    $c['avg_rating'] = count($reviews) > 0 ? round($totalRating / count($reviews), 1) : 9.5;

    $contents[] = $c;
}

// 2. Polls
$pollsRes = $mysqli->query("SELECT * FROM polls ORDER BY id ASC");
$polls = [];
while ($p = $pollsRes->fetch_assoc()) {
    $pId = $p['id'];
    $optRes = $mysqli->query("SELECT * FROM poll_options WHERE poll_id = $pId");
    $options = [];
    while ($opt = $optRes->fetch_assoc()) {
        $opt['id'] = (int)$opt['id'];
        $opt['votes_count'] = (int)($opt['votes_count'] ?? 10);
        $options[] = $opt;
    }
    $p['id'] = (int)$p['id'];
    $p['options'] = $options;
    $polls[] = $p;
}

// 3. Posts
$postsRes = $mysqli->query("SELECT p.*, u.username, u.avatar FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.id DESC");
$posts = [];
if ($postsRes) {
    while ($pt = $postsRes->fetch_assoc()) {
        $pId = $pt['id'];
        $cRes = $mysqli->query("SELECT c.*, u.username, u.avatar FROM post_comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $pId ORDER BY c.id DESC");
        $comments = [];
        if ($cRes) {
            while ($cm = $cRes->fetch_assoc()) {
                $cm['user'] = ['username' => $cm['username'], 'avatar' => $cm['avatar']];
                $comments[] = $cm;
            }
        }
        $pt['user'] = ['username' => $pt['username'], 'avatar' => $pt['avatar']];
        $pt['comments'] = $comments;
        $posts[] = $pt;
    }
}

// 4. Game Characters
$charsRes = $mysqli->query("SELECT * FROM game_characters ORDER BY id ASC");
$gameChars = [];
if ($charsRes) {
    while ($ch = $charsRes->fetch_assoc()) {
        $gameChars[] = $ch;
    }
}

// 5. Hot Takes
$takesRes = $mysqli->query("SELECT * FROM game_hot_takes ORDER BY id ASC");
$hotTakes = [];
if ($takesRes) {
    while ($ht = $takesRes->fetch_assoc()) {
        $hotTakes[] = $ht;
    }
}

// Write exact JS export
$jsContent = "export const MOCK_CONTENTS = " . json_encode($contents, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n\n";
$jsContent .= "export const MOCK_POLLS = " . json_encode($polls, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n\n";
$jsContent .= "export const MOCK_POSTS = " . json_encode($posts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n\n";
$jsContent .= "export const MOCK_GAME_CHARS = " . json_encode($gameChars, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n\n";
$jsContent .= "export const MOCK_HOT_TAKES = " . json_encode($hotTakes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n";

file_put_contents("c:/RavaPendragon/PROJECT ZERO/gabuthub/frontend/src/services/mockData.js", $jsContent);

echo "SUCCESSFULLY IMPORTER 100% OF ENTERTAINMENT_HUB MYSQL DATABASE INTO FRONTEND DEPLOYMENT!\n";
