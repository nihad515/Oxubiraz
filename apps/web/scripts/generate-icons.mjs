/**
 * Generates PWA icons from an SVG source.
 * Run: node scripts/generate-icons.mjs
 * Requires: sharp (npm install -D sharp)
 */
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public/icons');
mkdirSync(OUT, { recursive: true });

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#7c3aed');
  grad.addColorStop(1, '#6d28d9');
  ctx.fillStyle = grad;

  // Rounded rect
  const r = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.arcTo(size, 0, size, r, r);
  ctx.lineTo(size, size - r);
  ctx.arcTo(size, size, size - r, size, r);
  ctx.lineTo(r, size);
  ctx.arcTo(0, size, 0, size - r, r);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();
  ctx.fill();

  // Letter O
  const fs = size * 0.55;
  ctx.fillStyle = 'white';
  ctx.font = `bold ${fs}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('O', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

for (const size of SIZES) {
  const buf = generateIcon(size);
  writeFileSync(path.join(OUT, `icon-${size}x${size}.png`), buf);
  console.log(`Generated icon-${size}x${size}.png`);
}

// Apple touch icon (180x180)
const apple = generateIcon(180);
writeFileSync(path.join(OUT, 'apple-touch-icon.png'), apple);
console.log('Generated apple-touch-icon.png');

// Favicon (32x32)
const fav = generateIcon(32);
writeFileSync(path.join(OUT, 'icon-32x32.png'), fav);
console.log('Generated icon-32x32.png');

console.log('All icons generated.');
