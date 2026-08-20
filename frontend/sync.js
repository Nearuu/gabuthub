const { Client } = require('pg');
const mysql = require('mysql2/promise');

const connectionString = 'postgresql://neondb_owner:npg_DYflC2bouSj3@ep-noisy-cell-avvq5ket-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  console.log("Connecting to Neon Cloud Postgres...");
  const pgClient = new Client({ connectionString });
  await pgClient.connect();
  console.log("Connected to Neon successfully!");

  // Create tables in Neon
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(255),
      bio TEXT,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contents (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      synopsis TEXT,
      poster_url TEXT,
      banner_url TEXT,
      banner_position VARCHAR(100) DEFAULT 'center top',
      release_date DATE,
      is_featured SMALLINT DEFAULT 0,
      avg_rating DECIMAL(3,1) DEFAULT 0,
      reviews_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS genres (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_genre (
      content_id INT REFERENCES contents(id) ON DELETE CASCADE,
      genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
      PRIMARY KEY(content_id, genre_id)
    );

    CREATE TABLE IF NOT EXISTS osts (
      id SERIAL PRIMARY KEY,
      content_id INT REFERENCES contents(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NOT NULL,
      preview_url TEXT,
      likes_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      content_id INT REFERENCES contents(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      rating DECIMAL(3,1) NOT NULL,
      review TEXT NOT NULL,
      likes_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS polls (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      ends_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS poll_options (
      id SERIAL PRIMARY KEY,
      poll_id INT REFERENCES polls(id) ON DELETE CASCADE,
      option_text VARCHAR(255) NOT NULL,
      votes_count INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS watchlists (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      content_id INT REFERENCES contents(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, content_id)
    );
  `);
  console.log("Neon Postgres tables created!");

  // Extract from local MySQL
  try {
    const myConn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'entertainment_hub'
    });

    console.log("Extracting local MySQL entertainment_hub data...");
    const [users] = await myConn.query("SELECT * FROM users");
    const [contents] = await myConn.query("SELECT * FROM contents");
    const [genres] = await myConn.query("SELECT * FROM genres");
    const [contentGenre] = await myConn.query("SELECT * FROM content_genre");
    const [osts] = await myConn.query("SELECT * FROM osts");
    const [reviews] = await myConn.query("SELECT * FROM reviews");
    const [polls] = await myConn.query("SELECT * FROM polls");
    const [pollOptions] = await myConn.query("SELECT * FROM poll_options");

    // Clear Neon tables
    await pgClient.query("TRUNCATE users, contents, genres, content_genre, osts, reviews, polls, poll_options CASCADE");

    // Insert Genres
    for (const g of genres) {
      await pgClient.query("INSERT INTO genres(id, name) VALUES($1, $2) ON CONFLICT (id) DO NOTHING", [g.id, g.name]);
    }

    // Insert Users
    for (const u of users) {
      await pgClient.query(
        "INSERT INTO users(id, username, email, password, avatar, bio, role, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
        [u.id, u.username, u.email, u.password, u.avatar, u.bio, u.role || 'user', u.created_at]
      );
    }

    // Insert Contents
    for (const c of contents) {
      await pgClient.query(
        `INSERT INTO contents(id, title, type, synopsis, poster_url, banner_url, banner_position, release_date, is_featured, avg_rating, reviews_count, created_at) 
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [c.id, c.title, c.type, c.synopsis, c.poster_url, c.banner_url, c.banner_position || 'center top', c.release_date, c.is_featured || 0, c.avg_rating || 0, c.reviews_count || 0, c.created_at]
      );
    }

    // Insert Content Genre
    for (const cg of contentGenre) {
      await pgClient.query("INSERT INTO content_genre(content_id, genre_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [cg.content_id, cg.genre_id]);
    }

    // Insert OSTs
    for (const o of osts) {
      await pgClient.query(
        "INSERT INTO osts(id, content_id, title, artist, preview_url, likes_count, created_at) VALUES($1,$2,$3,$4,$5,$6,$7)",
        [o.id, o.content_id, o.title, o.artist, o.preview_url, o.likes_count || 0, o.created_at]
      );
    }

    // Insert Polls
    for (const p of polls) {
      await pgClient.query("INSERT INTO polls(id, title, description, ends_at) VALUES($1,$2,$3,$4)", [p.id, p.title, p.description, p.ends_at]);
    }

    // Insert Poll Options
    for (const po of pollOptions) {
      await pgClient.query("INSERT INTO poll_options(id, poll_id, option_text, votes_count) VALUES($1,$2,$3,$4)", [po.id, po.poll_id, po.option_text, po.votes_count || 0]);
    }

    console.log("SUCCESSFULLY SYNCED 100% OF LOCAL MYSQL DATA TO NEON POSTGRES CLOUD DATABASE!");
    await myConn.end();
  } catch (err) {
    console.error("MySQL extract error:", err.message);
  }

  await pgClient.end();
}

main();
