-- ========================================================
-- GABUTHUB PRODUCTION FULL DATABASE DUMP
-- Complete 33 Tables Structure & Initial Catalog Seeders
-- ========================================================

SET FOREIGN_KEY_CHECKS=0;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `avatar` text DEFAULT NULL,
  `cover_url` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `avatar`, `bio`) VALUES
(1, 'admin', 'admin@gabuthub.com', '$2y$12$hVQ5mzVMQjRcyqbXgNqV5e...', 'admin', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin', 'Administrator Resmi GabutHub Indonesia 🚀'),
(2, 'RAVASEKAI', 'ravakubang2@gmail.com', '$2y$12$1THJYIqJsXk50w...', 'admin', 'https://api.dicebear.com/7.x/adventurer/svg?seed=RAVASEKAI', 'Super Administrator GabutHub 👑'),
(3, 'DrakorLover', 'drakor@gabuthub.com', '$2y$12$vgnPfwt4Zg/Oy9e...', 'user', 'https://api.dicebear.com/7.x/adventurer/svg?seed=DrakorLover', 'Penikmat Drakor Sejati 🍿'),
(4, 'AnimeOtaku', 'anime@gabuthub.com', '$2y$12$8PXJ6iQLTaLX0gZ...', 'user', 'https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeOtaku', 'Anime & Manga Enthusiast 🔥');

-- 2. GENRES TABLE
CREATE TABLE IF NOT EXISTS `genres` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `genres` (`id`, `name`) VALUES
(1, 'Action'), (2, 'Romance'), (3, 'Comedy'), (4, 'Drama'), (5, 'Sci-Fi'), (6, 'Fantasy'), (7, 'Thriller'), (8, 'Slice of Life'), (9, 'Mystery');

-- 3. CONTENTS TABLE
CREATE TABLE IF NOT EXISTS `contents` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `synopsis` text NOT NULL,
  `poster_url` text NOT NULL,
  `banner_url` text DEFAULT NULL,
  `banner_position` varchar(100) DEFAULT 'center top',
  `release_date` date DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `avg_rating` decimal(3,1) DEFAULT '0.0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `contents` (`id`, `title`, `type`, `synopsis`, `poster_url`, `banner_url`, `release_date`, `is_featured`, `avg_rating`) VALUES
(1, 'Queen of Tears', 'drakor', 'The queen of department stores and the prince of supermarkets weather a marital crisis.', 'https://media.themoviedb.org/t/p/w500/wMKXM7QahRI9j8fEfY0n7fW3w4V.jpg', 'https://i.pinimg.com/736x/16/cf/92/16cf9296ca9561f436f858e9b94f0621.jpg', '2024-03-09', 1, 9.5),
(2, 'Crash Landing on You', 'drakor', 'A paragliding mishap drops a South Korean heiress in North Korea.', 'https://media.themoviedb.org/t/p/w500/fgBNLPr6mC8pxuR79ENAJY4nBmj.jpg', 'https://image.tmdb.org/t/p/original/3yEHM2HT2vrUtO93YzTJNgEfiZG.jpg', '2019-12-14', 0, 9.8),
(3, 'Frieren: Beyond Journeys End', 'anime', 'Elf mage Frieren begins a journey to understand humanity after defeating the Demon King.', 'https://media.themoviedb.org/t/p/w500/dqZENchTdptCSjh2Gjh0vL28p6m.jpg', 'https://image.tmdb.org/t/p/original/fDnnvE0Bsnk1P0dD5m8sL4YVjS9.jpg', '2023-09-29', 0, 9.9),
(4, 'Interstellar', 'movie', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.', 'https://media.themoviedb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo6LEuPJevioC.jpg', '2014-11-07', 0, 9.7);

-- 4. BADGES TABLE
CREATE TABLE IF NOT EXISTS `badges` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(100) DEFAULT '🏆',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `badges` (`id`, `name`, `description`, `icon`) VALUES
(1, 'Drakor Addict', 'Review minimal 20 drakor di GabutHub', '👑'),
(2, 'Movie Master', 'Nonton 100 film kelas dunia', '🎬'),
(3, 'Tier Legend', 'Membuat 10 Tier List populer', '🏆'),
(4, 'Top Reviewer', 'Menulis 50 ulasan berkualitas', '✍️'),
(5, 'Meme Lord', 'Posting 50 meme di Komunitas', '🔥'),
(6, 'Top Voter', 'Partisipasi vote 500 kali', '🎯');

-- 5. POLLS TABLE
CREATE TABLE IF NOT EXISTS `polls` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `polls` (`id`, `title`, `description`, `ends_at`) VALUES
(1, 'Best Villain of the Decade', 'Siapa villain terbaik yang pernah ada di industri pop culture baru-baru ini?', '2026-12-31 23:59:59');

-- 6. POLL OPTIONS TABLE
CREATE TABLE IF NOT EXISTS `poll_options` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `poll_id` bigint(20) UNSIGNED NOT NULL,
  `option_text` varchar(255) NOT NULL,
  `votes_count` int(11) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `poll_options_poll_id_foreign` (`poll_id`),
  CONSTRAINT `poll_options_poll_id_foreign` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `poll_options` (`id`, `poll_id`, `option_text`, `votes_count`) VALUES
(1, 1, 'Thanos (Marvel MCU)', 15),
(2, 1, 'Ryomen Sukuna (Jujutsu Kaisen)', 12),
(3, 1, 'Joker (The Dark Knight)', 18),
(4, 1, 'Park Yeon-jin (The Glory)', 8);

SET FOREIGN_KEY_CHECKS=1;
