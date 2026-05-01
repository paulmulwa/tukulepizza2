const fs = require('fs');
const https = require('https');
const path = require('path');

const IMAGES = [
  { slug: 'margherita', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop' },
  { slug: 'diavola', url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop' },
  { slug: 'bbq-beef', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop' },
  { slug: 'garden-fresh', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop' },
  { slug: 'pepperoni-feast', url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop' },
  { slug: 'truffle-mushroom', url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=800&auto=format&fit=crop' },
  { slug: 'hot-chicken', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop' },
  { slug: 'napolitana', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop' }
];

const destDir = path.join(__dirname, '..', 'public', 'images');

async function downloadImages() {
  for (const img of IMAGES) {
    const dest = path.join(destDir, `${img.slug}.webp`);
    console.log(`Downloading ${img.slug}...`);
    await new Promise((resolve, reject) => {
      https.get(img.url, (res) => {
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });
  }
  console.log('All images downloaded.');
}

downloadImages().catch(console.error);
