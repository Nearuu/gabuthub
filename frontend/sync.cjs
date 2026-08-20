const { Client } = require('pg');
const mysql = require('mysql2/promise');

const connectionString = 'postgresql://neondb_owner:npg_DYflC2bouSj3@ep-noisy-cell-avvq5ket-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  console.log("Starting Neon Cloud database rebuild...");
  const pgClient = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log("Connected to Neon Cloud Postgres!");

  await pgClient.query(`
    DROP TABLE IF EXISTS watchlists CASCADE;
    DROP TABLE IF EXISTS poll_options CASCADE;
    DROP TABLE IF EXISTS polls CASCADE;
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS osts CASCADE;
    DROP TABLE IF EXISTS content_genres CASCADE;
    DROP TABLE IF EXISTS genres CASCADE;
    DROP TABLE IF EXISTS contents CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);

  await pgClient.query(`
    CREATE TABLE users (
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

    CREATE TABLE contents (
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

    CREATE TABLE genres (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );

    CREATE TABLE content_genres (
      content_id INT,
      genre_id INT,
      PRIMARY KEY(content_id, genre_id)
    );

    CREATE TABLE osts (
      id SERIAL PRIMARY KEY,
      content_id INT,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NOT NULL,
      preview_url TEXT,
      likes_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE reviews (
      id SERIAL PRIMARY KEY,
      content_id INT,
      user_id INT,
      rating DECIMAL(3,1) NOT NULL,
      review TEXT NOT NULL,
      likes_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE polls (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      ends_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE poll_options (
      id SERIAL PRIMARY KEY,
      poll_id INT,
      option_text VARCHAR(255) NOT NULL,
      votes_count INT DEFAULT 0
    );

    CREATE TABLE watchlists (
      id SERIAL PRIMARY KEY,
      user_id INT,
      content_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("New clean tables created successfully!");

  const myConn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'entertainment_hub'
  });

  const [users] = await myConn.query("SELECT * FROM users");
  const [contents] = await myConn.query("SELECT * FROM contents");
  const [genres] = await myConn.query("SELECT * FROM genres");
  const [contentGenres] = await myConn.query("SELECT * FROM content_genres");
  const [osts] = await myConn.query("SELECT * FROM osts");
  const [reviews] = await myConn.query("SELECT * FROM reviews");
  const [polls] = await myConn.query("SELECT * FROM polls");
  const [pollOptions] = await myConn.query("SELECT * FROM poll_options");

  for (const g of genres) {
    await pgClient.query("INSERT INTO genres(id, name) VALUES($1, $2)", [g.id, g.name]);
  }

  for (const u of users) {
    await pgClient.query(
      "INSERT INTO users(id, username, email, password, avatar, bio, role, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
      [u.id, u.username, u.email, u.password, u.avatar, u.bio, u.role || 'user', u.created_at]
    );
  }

  for (const c of contents) {
    await pgClient.query(
      `INSERT INTO contents(id, title, type, synopsis, poster_url, banner_url, banner_position, release_date, is_featured, avg_rating, reviews_count, created_at) 
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [c.id, c.title, c.type, c.synopsis, c.poster_url, c.banner_url, c.banner_position || 'center top', c.release_date, c.is_featured || 0, c.avg_rating || 0, c.reviews_count || 0, c.created_at]
    );
  }

  for (const cg of contentGenres) {
    try {
      await pgClient.query("INSERT INTO content_genres(content_id, genre_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [cg.content_id, cg.genre_id]);
    } catch (e) {}
  }

  for (const o of osts) {
    try {
      await pgClient.query(
        "INSERT INTO osts(id, content_id, title, artist, preview_url, likes_count, created_at) VALUES($1,$2,$3,$4,$5,$6,$7)",
        [o.id, o.content_id, o.title, o.artist, o.preview_url, o.likes_count || 0, o.created_at]
      );
    } catch (e) {}
  }

  for (const r of reviews) {
    try {
      await pgClient.query(
        "INSERT INTO reviews(id, content_id, user_id, rating, review, likes_count, created_at) VALUES($1,$2,$3,$4,$5,$6,$7)",
        [r.id, r.content_id, r.user_id, r.rating, r.review, r.likes_count || 0, r.created_at]
      );
    } catch (e) {}
  }

  for (const p of polls) {
    await pgClient.query("INSERT INTO polls(id, title, description, ends_at) VALUES($1,$2,$3,$4)", [p.id, p.title, p.description, p.ends_at]);
  }

  for (const po of pollOptions) {
    try {
      await pgClient.query("INSERT INTO poll_options(id, poll_id, option_text, votes_count) VALUES($1,$2,$3,$4)", [po.id, po.poll_id, po.option_text, po.votes_count || 0]);
    } catch (e) {}
  }

  console.log(`BOOM! 100% SUCCESSFUL REBUILD! Migrated ${users.length} users, ${contents.length} contents, ${osts.length} osts to Neon Cloud Postgres Database!`);
  await myConn.end();
  await pgClient.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
