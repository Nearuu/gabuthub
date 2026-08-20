const axios = require('axios');
const mysql = require('mysql2/promise');

const RAILWAY_API = "https://gabuthub-production.up.railway.app/api";

async function main() {
  console.log("Connecting to local MySQL...");
  const myConn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'entertainment_hub'
  });

  const [contents] = await myConn.query("SELECT * FROM contents");
  console.log(`Found ${contents.length} contents in local MySQL. Uploading to Railway...`);

  let count = 0;
  for (const c of contents) {
    try {
      // Fetch genres
      const [genres] = await myConn.query("SELECT g.name FROM genres g JOIN content_genres cg ON g.id = cg.genre_id WHERE cg.content_id = ?", [c.id]);
      
      const payload = {
        title: c.title,
        type: c.type,
        synopsis: c.synopsis,
        poster_url: c.poster_url,
        banner_url: c.banner_url,
        banner_position: c.banner_position || 'center top',
        release_date: c.release_date,
        is_featured: c.is_featured || 0,
        genres: genres.map(g => g.name)
      };

      await axios.post(`${RAILWAY_API}/contents`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      count++;
      console.log(`[${count}/${contents.length}] Uploaded: ${c.title}`);
    } catch (e) {
      console.log(`Skipped/Error on "${c.title}": ${e.message}`);
    }
  }

  console.log("SUCCESSFULLY POPULATED RAILWAY BACKEND WITH ALL MYSQL DATA!");
  await myConn.end();
  process.exit(0);
}

main();
