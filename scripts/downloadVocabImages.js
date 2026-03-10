#!/usr/bin/env node
/**
 * Download vocab images from Pexels for HSK1 Lesson 5.
 * Usage:  node scripts/downloadVocabImages.js --key YOUR_PEXELS_API_KEY
 *
 * Get a free key at: https://www.pexels.com/api/
 * Free tier: 200 requests/hour, 20 000/month — more than enough.
 *
 * After running:
 *  - Images are saved to assets/vocab_images/hsk1_l5/<word>/<n>.jpg
 *  - data/hsk1_l5_images.json is updated with real URLs (local paths)
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ─────────────────────────────────────────────────────────────────
const DATA_FILE  = path.join(__dirname, '../data/hsk1/hsk1_images/hsk1_images.json');
const OUT_DIR    = path.join(__dirname, '../assets/vocab_images/hsk1_l5');
const IMAGES_PER_WORD = 4;
const PEXELS_API = 'https://api.pexels.com/v1/search';

// ── Helpers ────────────────────────────────────────────────────────────────
function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, body }); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

function slugify(word) {
  // Convert Chinese word to a safe directory name using pinyin from data
  return word
    .replace(/\s+/g, '_')
    .replace(/[^\w\u4e00-\u9fff]/g, '')
    .slice(0, 20);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const keyArg = process.argv.find(a => a.startsWith('--key=')) ||
                 process.argv[process.argv.indexOf('--key') + 1];
  const apiKey = keyArg?.replace('--key=', '') || process.env.PEXELS_API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    console.error('❌  Provide your Pexels API key:\n   node scripts/downloadVocabImages.js --key YOUR_KEY');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let updated = 0;

  for (const [word, wordData] of Object.entries(data.vocab_images)) {
    const slug = slugify(word);
    const wordDir = path.join(OUT_DIR, slug);
    fs.mkdirSync(wordDir, { recursive: true });

    console.log(`\n🔍  Searching: "${word}" (${wordData.english}) — "${wordData.pexels_query}"`);

    const { status, body } = await get(
      `${PEXELS_API}?query=${encodeURIComponent(wordData.pexels_query)}&per_page=${IMAGES_PER_WORD}&orientation=square`,
      { Authorization: apiKey }
    );

    if (status !== 200 || !body.photos) {
      console.warn(`   ⚠️  No results (status ${status})`);
      continue;
    }

    const photos = body.photos.slice(0, IMAGES_PER_WORD);

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const imgUrl = photo.src.medium; // ~350px wide, good quality
      const localPath = path.join(wordDir, `${i + 1}.jpg`);
      const relativePath = `assets/vocab_images/hsk1_l5/${slug}/${i + 1}.jpg`;

      process.stdout.write(`   📥  ${i + 1}/${photos.length} → ${relativePath} ... `);
      await downloadFile(imgUrl, localPath);
      console.log('✓');

      // Update the JSON entry
      if (data.vocab_images[word].images[i]) {
        data.vocab_images[word].images[i].url = relativePath;
        data.vocab_images[word].images[i].pexels_id = photo.id;
        data.vocab_images[word].images[i].pexels_credit = photo.photographer;
        updated++;
      }
    }

    await sleep(300); // be polite to the API
  }

  // Save updated JSON
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`\n✅  Done! Updated ${updated} image entries in data/hsk1_l5_images.json`);
  console.log(`📁  Images saved to: assets/vocab_images/hsk1_l5/`);
  console.log(`\nNext: restart Expo (expo start --clear) to bundle the new images.`);
}

main().catch(err => { console.error(err); process.exit(1); });
