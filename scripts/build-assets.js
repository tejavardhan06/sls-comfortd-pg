const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const assets = [
  ['node_modules/lucide/dist/umd/lucide.min.js', 'vendor/lucide.min.js'],
  ['node_modules/gsap/dist/gsap.min.js', 'vendor/gsap.min.js'],
  ['node_modules/gsap/dist/ScrollTrigger.min.js', 'vendor/ScrollTrigger.min.js'],
  ...['400', '500', '600', '700'].map(weight => [`node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff2`, `fonts/inter-latin-${weight}.woff2`]),
  ...['400', '500', '600', '700', '800'].map(weight => [`node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${weight}-normal.woff2`, `fonts/plus-jakarta-sans-latin-${weight}.woff2`]),
  ...['400', '500', '600'].map(weight => [`node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-${weight}-normal.woff2`, `fonts/ibm-plex-mono-latin-${weight}.woff2`])
];

for (const [source, destination] of assets) {
  const from = path.join(root, source);
  const to = path.join(root, destination);
  fs.mkdirSync(path.dirname(to), { recursive:true });
  fs.copyFileSync(from, to);
}

console.log(`Copied ${assets.length} local production assets.`);
