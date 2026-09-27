import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGO_URL = "https://i.ibb.co/mrGsQ2GT/logo.png";
const PUBLIC_DIR = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { timeout: 2500 }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out'));
    });

    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  const tempDest = path.join(PUBLIC_DIR, 'logo.png');
  const icon192 = path.join(PUBLIC_DIR, 'icon-192.png');

  // If assets already exist, we don't need to block the build
  const hasExistingAssets = fs.existsSync(icon192) && fs.statSync(icon192).size > 0;

  try {
    console.log("Downloading existing website logo for PWA assets...");
    await downloadFile(LOGO_URL, tempDest);
    
    // Copy the logo to standard icon paths for robustness
    fs.copyFileSync(tempDest, path.join(PUBLIC_DIR, 'icon-192.png'));
    fs.copyFileSync(tempDest, path.join(PUBLIC_DIR, 'icon-512.png'));
    fs.copyFileSync(tempDest, path.join(PUBLIC_DIR, 'maskable-icon.png'));
    fs.copyFileSync(tempDest, path.join(PUBLIC_DIR, 'favicon.png'));
    fs.copyFileSync(tempDest, path.join(PUBLIC_DIR, 'favicon.ico'));
    
    console.log("All PWA assets downloaded and prepared successfully!");
  } catch (error) {
    if (hasExistingAssets) {
      console.warn("External network unavailable during build, using existing PWA icons in /public.");
      return;
    }
    console.error("Warning: Could not download logo, but continuing build:", error.message);
  }
}

main();
