export const MOCK_CONTENTS = [
  {
    id: 1,
    title: "Crash Landing on You",
    type: "drakor",
    synopsis: "Kisah cinta tak terduga antara pewaris tahta kaya raya asal Korea Selatan yang tersesat di Korea Utara setelah kecelakaan paralayang, dengan perwira militer Korea Utara yang melindunginya.",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60",
    banner_url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=60",
    banner_position: "center top",
    release_date: "2019-12-14",
    is_featured: 1,
    avg_rating: 9.8,
    reviews_count: 1420,
    genres: [{ id: 2, name: "Romance" }, { id: 7, name: "Drama" }],
    osts: [
      { id: 1, title: "Give You My Heart", artist: "IU", preview_url: "https://www.youtube.com/watch?v=32wDFCM7iSI" },
      { id: 2, title: "Here I Am Again", artist: "Yerin Baek", preview_url: "https://www.youtube.com/watch?v=BtwZ0F2pXxE" }
    ],
    reviews: [
      { id: 1, user: { username: "DrakorQueen" }, rating: 10, review: "Masterpiece! Chemistry Hyun Bin dan Son Ye-jin luar biasa tulus.", created_at: "2026-08-01" }
    ]
  },
  {
    id: 2,
    title: "Queen of Tears",
    type: "drakor",
    synopsis: "Krisis dan kebangkitan cinta antara Ratu Toko Serba Ada dan putra Kepala Desa dalam ujian pernikahan mereka yang penuh liku.",
    poster_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60",
    banner_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=60",
    banner_position: "center top",
    release_date: "2024-03-09",
    is_featured: 0,
    avg_rating: 9.7,
    reviews_count: 980,
    genres: [{ id: 2, name: "Romance" }, { id: 7, name: "Drama" }],
    osts: [
      { id: 3, title: "Love You With All My Heart", artist: "Crush", preview_url: "https://www.youtube.com/watch?v=7u3S3N7vG-E" }
    ],
    reviews: []
  },
  {
    id: 3,
    title: "Vincenzo",
    type: "drakor",
    synopsis: "Pengacara mafia asal Italia yang kembali ke tanah air Korea untuk menguasai emas batangan di balik gedung tua Cassano Plaza.",
    poster_url: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=500&auto=format&fit=crop&q=60",
    banner_url: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1200&auto=format&fit=crop&q=60",
    banner_position: "center top",
    release_date: "2021-02-20",
    is_featured: 0,
    avg_rating: 9.6,
    reviews_count: 850,
    genres: [{ id: 1, name: "Action" }, { id: 3, name: "Comedy" }],
    osts: [
      { id: 4, title: "Adrenaline", artist: "Solar (MAMAMOO)", preview_url: "https://www.youtube.com/watch?v=a3Yw0ZJ6b-k" }
    ],
    reviews: []
  },
  {
    id: 4,
    title: "Frieren: Beyond Journey's End",
    type: "anime",
    synopsis: "Petualangan penyihir elf legendaris Frieren memahami arti kehidupan dan waktu setelah mengalahkan Raja Iblis.",
    poster_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    banner_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=60",
    banner_position: "center top",
    release_date: "2023-09-29",
    is_featured: 0,
    avg_rating: 9.9,
    reviews_count: 2100,
    genres: [{ id: 4, name: "Fantasy" }, { id: 6, name: "Slice of Life" }],
    osts: [
      { id: 5, title: "Yuusha (The Hero)", artist: "YOASOBI", preview_url: "https://www.youtube.com/watch?v=OIBODIPC_8Y" }
    ],
    reviews: []
  },
  {
    id: 5,
    title: "Interstellar",
    type: "movie",
    synopsis: "Perjalanan sekelompok astronot melewati lubang cacing di luar angkasa demi menemukan planet baru bagi kelangsungan hidup manusia.",
    poster_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
    banner_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=60",
    banner_position: "center top",
    release_date: "2014-11-07",
    is_featured: 0,
    avg_rating: 9.5,
    reviews_count: 3100,
    genres: [{ id: 8, name: "Sci-Fi" }, { id: 7, name: "Drama" }],
    osts: [],
    reviews: []
  }
];

export const MOCK_POLLS = [
  {
    id: 1,
    title: "Best Drakor Romance of The Year",
    description: "Tentukan mana drakor romance terbaik pilihan kalian!",
    ends_at: "2026-12-31 23:59:59",
    options: [
      { id: 1, option_text: "Crash Landing on You", votes_count: 450 },
      { id: 2, option_text: "Queen of Tears", votes_count: 520 },
      { id: 3, option_text: "Goblin", votes_count: 310 }
    ]
  }
];
