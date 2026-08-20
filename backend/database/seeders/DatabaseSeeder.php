<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Content;
use App\Models\Genre;
use App\Models\Ost;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\Badge;
use App\Models\GameHotTake;
use App\Models\GameCharacter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed standard badges (if not exists)
        $standardBadges = [
            [
                'id' => 1,
                'name' => 'Drakor Addict',
                'description' => 'Sudah review 20 drakor',
                'icon' => '🥇'
            ],
            [
                'id' => 2,
                'name' => 'Movie Master',
                'description' => 'Sudah nonton 100 film',
                'icon' => '🎬'
            ],
            [
                'id' => 3,
                'name' => 'Tier Legend',
                'description' => 'Bikin 10 Tier List',
                'icon' => '🏆'
            ],
            [
                'id' => 4,
                'name' => 'Reviewer',
                'description' => '50 Review',
                'icon' => '💬'
            ],
            [
                'id' => 5,
                'name' => 'Meme Lord',
                'description' => 'Posting 50 meme',
                'icon' => '😂'
            ],
            [
                'id' => 6,
                'name' => 'Top Voter',
                'description' => 'Vote 500 kali',
                'icon' => '🔥'
            ]
        ];

        foreach ($standardBadges as $badgeData) {
            Badge::updateOrCreate(['id' => $badgeData['id']], $badgeData);
        }

        // 2. Ensure basic genres exist
        $genres = ['Action', 'Romance', 'Comedy', 'Fantasy', 'Thriller', 'Slice of Life', 'Drama', 'Sci-Fi', 'Mystery'];
        $genreModels = [];
        foreach ($genres as $name) {
            $genreModels[$name] = Genre::firstOrCreate(['name' => $name]);
        }

        // 3. Seed test users
        $admin = User::firstOrCreate(
            ['email' => 'admin@gabuthub.com'],
            [
                'username' => 'admin',
                'password' => Hash::make('password123'),
                'avatar' => 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
                'bio' => 'Administrator of GabutHub. Keeping the fun alive.',
                'role' => 'admin'
            ]
        );

        $user1 = User::firstOrCreate(
            ['email' => 'user1@example.com'],
            [
                'username' => 'wibu_sejati',
                'password' => Hash::make('password123'),
                'avatar' => 'https://api.dicebear.com/7.x/adventurer/svg?seed=wibusejati',
                'bio' => 'Anime is life. Watchlist penuh.',
                'role' => 'user'
            ]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'user2@example.com'],
            [
                'username' => 'drakor_queen',
                'password' => Hash::make('password123'),
                'avatar' => 'https://api.dicebear.com/7.x/adventurer/svg?seed=drakorqueen',
                'bio' => 'Watching Queen of Tears for the 10th time.',
                'role' => 'user'
            ]
        );

        // 4. Seed Content
        $contentsData = [
            [
                'title' => 'Queen of Tears',
                'type' => 'drakor',
                'synopsis' => 'The queen of department stores and the prince of supermarkets weather a marital crisis — then love miraculously begins to bloom again.',
                'poster_url' => 'https://media.themoviedb.org/t/p/w500/wMKXM7QahRI9j8fEfY0n7fW3w4V.jpg',
                'banner_url' => 'https://i.pinimg.com/736x/16/cf/92/16cf9296ca9561f436f858e9b94f0621.jpg',
                'banner_position' => 'center top',
                'release_date' => '2024-03-09',
                'genres' => ['Romance', 'Drama']
            ],
            [
                'title' => 'Crash Landing on You',
                'type' => 'drakor',
                'synopsis' => 'A paragliding mishap drops a South Korean heiress in North Korea — and into the life of an army officer, who decides he will help her hide.',
                'poster_url' => 'https://media.themoviedb.org/t/p/w500/fgBNLPr6mC8pxuR79ENAJY4nBmj.jpg',
                'banner_url' => 'https://image.tmdb.org/t/p/original/3yEHM2HT2vrUtO93YzTJNgEfiZG.jpg',
                'banner_position' => 'center top',
                'release_date' => '2019-12-14',
                'genres' => ['Romance', 'Comedy', 'Drama']
            ],
            [
                'title' => 'Descendants of the Sun',
                'type' => 'drakor',
                'synopsis' => 'A soldier belonging to the South Korean Special Forces falls in love with a beautiful surgeon as they deal with disasters in a war-torn country.',
                'poster_url' => 'https://media.themoviedb.org/t/p/w500/xxGomfml0x9iyPBS4StBjbRRu65.jpg',
                'banner_url' => 'https://image.tmdb.org/t/p/original/wmSXIPPiM7HQuRAuMoqfIbdrrwU.jpg',
                'banner_position' => 'center top',
                'release_date' => '2016-02-24',
                'genres' => ['Romance', 'Action', 'Drama']
            ],
            [
                'title' => 'Goblin',
                'type' => 'drakor',
                'synopsis' => 'In his quest for a bride to break his immortal curse, a 939-year-old guardian of souls meets a bright high school student.',
                'poster_url' => 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Goblin.jpg',
                'banner_url' => 'https://image.tmdb.org/t/p/original/smSbK5cd8T9XHcxEUcems23BDEF.jpg',
                'banner_position' => 'center top',
                'release_date' => '2016-12-02',
                'genres' => ['Romance', 'Fantasy', 'Drama']
            ],
            [
                'title' => 'Hospital Playlist',
                'type' => 'drakor',
                'synopsis' => 'Five doctors who have been friends since medical school stay close while working together at the same hospital.',
                'poster_url' => 'https://upload.wikimedia.org/wikipedia/en/e/e8/Hospital_Playlist.jpg',
                'banner_url' => 'https://image.tmdb.org/t/p/original/6YnP7zP8GPgjA6wOsOuEetxmukr.jpg',
                'banner_position' => 'center top',
                'release_date' => '2020-03-12',
                'genres' => ['Drama', 'Slice of Life', 'Comedy']
            ],
            [
                'title' => 'Hotel Del Luna',
                'type' => 'drakor',
                'synopsis' => 'When he is invited to manage a hotel for dead souls, an elite hotelier gets to know the establishment\'s ancient owner and her mystical world.',
                'poster_url' => 'https://upload.wikimedia.org/wikipedia/en/0/00/Hotel_Del_Luna.jpg',
                'banner_url' => 'https://image.tmdb.org/t/p/original/d77WPPNbuvyGJJ675UFokVmOKHb.jpg',
                'banner_position' => 'center top',
                'release_date' => '2019-07-13',
                'genres' => ['Fantasy', 'Romance', 'Drama']
            ],
            [
                'title' => 'Itaewon Class',
                'type' => 'drakor',
                'synopsis' => 'An ex-con and his friends fight to make their ambitious dreams for their street bar a reality in a colorful neighborhood of Seoul.',
                'poster_url' => 'https://upload.wikimedia.org/wikipedia/en/9/99/Itaewon_Class.jpg',
                'banner_url' => 'https://image.tmdb.org/t/p/original/4IzdfRrxgbvtnE0ZBNEjlcFcxgc.jpg',
                'banner_position' => 'center top',
                'release_date' => '2020-01-31',
                'genres' => ['Drama', 'Romance']
            ],
            [
                'title' => 'True Beauty',
                'type' => 'drakor',
                'synopsis' => 'After being bullied and discriminated against because of her looks, a high school girl masters makeup to transform herself into a popular beauty.',
                'poster_url' => 'https://media.themoviedb.org/t/p/w500/I9WCyKUbKAiu95tAitaHOx8EVO.jpg',
                'banner_url' => 'https://image.tmdb.org/t/p/original/3E1GroTJCRdIYHa5n62GqjmqxQR.jpg',
                'banner_position' => 'center top',
                'release_date' => '2020-12-09',
                'genres' => ['Romance', 'Comedy', 'Drama']
            ],
            [
                'title' => 'Twenty Five Twenty One',
                'type' => 'drakor',
                'synopsis' => 'In a time when dreams seem out of reach, a teenage fencer pursues big ambitions and meets a hardworking young man who seeks to rebuild his life.',
                'poster_url' => 'https://upload.wikimedia.org/wikipedia/en/1/15/Twenty-Five_Twenty-One.jpg',
                'release_date' => '2022-02-12',
                'genres' => ['Romance', 'Drama']
            ],
            [
                'title' => 'The Glory',
                'type' => 'drakor',
                'synopsis' => 'A woman lives for absolute revenge against her childhood bullies who destroyed her life.',
                'poster_url' => 'https://i.pinimg.com/736x/c5/50/bc/c550bc207048a7ebab0b48e329b134be.jpg',
                'release_date' => '2022-12-30',
                'genres' => ['Thriller', 'Drama', 'Mystery']
            ],
            [
                'title' => 'Demon Slayer: Kimetsu no Yaiba',
                'type' => 'anime',
                'synopsis' => 'A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly.',
                'poster_url' => 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
                'release_date' => '2019-04-06',
                'genres' => ['Action', 'Fantasy']
            ],
            [
                'title' => 'Frieren: Beyond Journey\'s End',
                'type' => 'anime',
                'synopsis' => 'An elf mage and her former party members rebuild their lives after defeating the Demon King, contemplating mortality and time.',
                'poster_url' => 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
                'release_date' => '2023-09-29',
                'genres' => ['Fantasy', 'Slice of Life', 'Drama']
            ],
            [
                'title' => 'Spirited Away',
                'type' => 'anime',
                'synopsis' => 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
                'poster_url' => 'https://static.wikia.nocookie.net/studio-ghibli/images/9/9e/Spirited_Away_poster.jpg/revision/latest?cb=20210212001550',
                'release_date' => '2001-07-20',
                'genres' => ['Fantasy', 'Drama']
            ],

            // Movie (Film)
            [
                'title' => 'Interstellar',
                'type' => 'movie',
                'synopsis' => 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
                'release_date' => '2014-11-07',
                'genres' => ['Sci-Fi', 'Drama']
            ],
            [
                'title' => 'Inception',
                'type' => 'movie',
                'synopsis' => 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/oYuLEW9W2vBBGLdu2qMVyZ9cAU.jpg',
                'release_date' => '2010-07-16',
                'genres' => ['Action', 'Sci-Fi', 'Thriller']
            ],

            // MCU -> Movie
            [
                'title' => 'Avengers: Endgame',
                'type' => 'movie',
                'synopsis' => 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.',
                'poster_url' => 'https://i.pinimg.com/1200x/95/26/68/9526684fe11e38cf6bb6fbd48e37de6a.jpg',
                'release_date' => '2019-04-26',
                'genres' => ['Action', 'Sci-Fi', 'Fantasy']
            ],
            [
                'title' => 'Loki',
                'type' => 'movie',
                'synopsis' => 'The mercurial villain Loki resumes his role as the God of Mischief in a new series that takes place after the events of Avengers: Endgame.',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/voHU17yYyoXD2wJ2qj123yX31y.jpg',
                'release_date' => '2021-06-09',
                'genres' => ['Action', 'Sci-Fi', 'Fantasy']
            ],

            // Series -> Drakor
            [
                'title' => 'Breaking Bad',
                'type' => 'drakor',
                'synopsis' => 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.',
                'poster_url' => 'https://i.pinimg.com/1200x/37/62/75/37627587496965efcc0ae42ac9dff525.jpg',
                'release_date' => '2008-01-20',
                'genres' => ['Drama', 'Thriller', 'Mystery']
            ],

            // MOVING - Featured drama for hero banner
            [
                'title' => 'MOVING',
                'type' => 'drakor',
                'synopsis' => 'Children who live in secret, hiding their superpowers, and their parents who carry painful pasts.',
                'poster_url' => '/images/moving_students.jpg',
                'release_date' => '2023-08-09',
                'is_featured' => true,
                'genres' => ['Action', 'Drama', 'Fantasy']
            ],

            // Additional anime/movie titles from mockup
            [
                'title' => 'Your Name',
                'type' => 'anime',
                'synopsis' => 'Two teenagers share a profound, magical connection upon discovering they are swapping bodies.',
                'poster_url' => 'https://cdn.myanimelist.net/images/anime/5/87048.jpg',
                'release_date' => '2016-08-26',
                'genres' => ['Romance', 'Fantasy', 'Drama']
            ],
            [
                'title' => 'A Silent Voice',
                'type' => 'anime',
                'synopsis' => 'A young man is ostracized by his classmates after he bullies a deaf girl to the point where she moves away. Years later, he seeks her out to make amends.',
                'poster_url' => 'https://i.pinimg.com/1200x/83/5c/d4/835cd4892e3741678f0fb99c0bdee8f5.jpg',
                'release_date' => '2016-09-17',
                'genres' => ['Romance', 'Drama']
            ],
            [
                'title' => 'Jujutsu Kaisen',
                'type' => 'anime',
                'synopsis' => 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman school to be able to locate the demons other body parts.',
                'poster_url' => 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
                'release_date' => '2020-10-03',
                'genres' => ['Action', 'Fantasy']
            ],
            [
                'title' => 'Solo Leveling',
                'type' => 'anime',
                'synopsis' => 'In a world where hunters must battle deadly monsters to protect humanity, Sung Jinwoo, the weakest hunter, gains the power to level up in strength.',
                'poster_url' => 'https://cdn.myanimelist.net/images/anime/1269/138766.jpg',
                'release_date' => '2024-01-07',
                'genres' => ['Action', 'Fantasy']
            ],
            [
                'title' => 'Weak Hero Class 1',
                'type' => 'drakor',
                'synopsis' => 'A smart and reclusive boy fights back against the bullies at his school using his wits and unconventional methods.',
                'poster_url' => 'https://i.mydramalist.com/6RPqrf.jpg',
                'release_date' => '2022-11-18',
                'genres' => ['Action', 'Drama']
            ]
        ];

        foreach ($contentsData as $c) {
            $contentModel = Content::firstOrCreate(
                ['title' => $c['title']],
                [
                    'type' => $c['type'],
                    'synopsis' => $c['synopsis'],
                    'poster_url' => $c['poster_url'],
                    'release_date' => $c['release_date']
                ]
            );

            // Sync genres
            $genreIds = [];
            foreach ($c['genres'] as $gName) {
                if (isset($genreModels[$gName])) {
                    $genreIds[] = $genreModels[$gName]->id;
                }
            }
            $contentModel->genres()->sync($genreIds);
        }

        // 5. Seed OSTs (Disabled - User will add OSTs manually)
        // 6. Seed Polls
        $poll1 = Poll::firstOrCreate(
            ['title' => 'Best Villain of the Decade'],
            [
                'description' => 'Siapa villain terbaik yang pernah ada di industri pop culture baru-baru ini?',
                'ends_at' => now()->addDays(30)
            ]
        );
        if ($poll1) {
            PollOption::firstOrCreate(['poll_id' => $poll1->id, 'option_text' => 'Thanos (Marvel MCU)']);
            PollOption::firstOrCreate(['poll_id' => $poll1->id, 'option_text' => 'Ryomen Sukuna (Jujutsu Kaisen)']);
            PollOption::firstOrCreate(['poll_id' => $poll1->id, 'option_text' => 'Joker (The Dark Knight)']);
            PollOption::firstOrCreate(['poll_id' => $poll1->id, 'option_text' => 'Park Yeon-jin (The Glory)']);
        }

        $poll2 = Poll::firstOrCreate(
            ['title' => 'Best Drakor Couple 2024'],
            [
                'description' => 'Pasangan drama korea mana yang paling bikin baper dan gregetan?',
                'ends_at' => now()->addDays(30)
            ]
        );
        if ($poll2) {
            PollOption::firstOrCreate(['poll_id' => $poll2->id, 'option_text' => 'Baek Hyun-woo & Hong Hae-in (Queen of Tears)']);
            PollOption::firstOrCreate(['poll_id' => $poll2->id, 'option_text' => 'Ri Jeong-hyeok & Yoon Se-ri (CLOY)']);
            PollOption::firstOrCreate(['poll_id' => $poll2->id, 'option_text' => 'Go Dong-man & Choi Ae-ra (Fight For My Way)']);
        }

        // 7. Seed Game Hot Takes
        $hotTakes = [
            ['text' => 'Ending drama Queen of Tears terasa terburu-buru dan maksa.', 'category' => 'Drakor'],
            ['text' => 'Thanos sebenarnya benar demi menyelamatkan ekosistem alam semesta.', 'category' => 'MCU'],
            ['text' => 'Anime shounen modern seperti Jujutsu Kaisen terlalu mengandalkan visual dibanding cerita.', 'category' => 'Anime'],
            ['text' => 'Variety Show Running Man sudah kehilangan keseruannya semenjak Lee Kwang-soo keluar.', 'category' => 'Variety'],
            ['text' => 'Nonton film di bioskop overrated, mending nonton streaming di kasur rumah.', 'category' => 'Umum'],
        ];
        foreach ($hotTakes as $ht) {
            GameHotTake::firstOrCreate(['text' => $ht['text']], ['category' => $ht['category']]);
        }

        // 8. Seed Game Flag Characters
        $characters = [
            [
                'name' => 'Baek Hyun-woo',
                'series' => 'Queen of Tears',
                'description' => 'Suami setia, cerdas, penyayang, rela bertaruh nyawa.',
                'avatar' => 'https://api.dicebear.com/7.x/adventurer/svg?seed=hyunwoo'
            ],
            [
                'name' => 'Ryomen Sukuna',
                'series' => 'Jujutsu Kaisen',
                'description' => 'Raja Kutukan, psikopat, membunuh demi kesenangan, arogan.',
                'avatar' => 'https://api.dicebear.com/7.x/adventurer/svg?seed=sukuna'
            ],
            [
                'name' => 'Park Yeon-jin',
                'series' => 'The Glory',
                'description' => 'Bullier kejam, berselingkuh, manipulatif, gaslighter kronis.',
                'avatar' => 'https://api.dicebear.com/7.x/adventurer/svg?seed=yeonjin'
            ],
            [
                'name' => 'Tanjiro Kamado',
                'series' => 'Demon Slayer',
                'description' => 'Kakak teladan, berhati murni, menghargai musuh sekalipun.',
                'avatar' => 'https://api.dicebear.com/7.x/adventurer/svg?seed=tanjiro'
            ],
        ];
        foreach ($characters as $char) {
            GameCharacter::firstOrCreate(['name' => $char['name']], [
                'series' => $char['series'],
                'description' => $char['description'],
                'avatar' => $char['avatar']
            ]);
        }
    }
}
