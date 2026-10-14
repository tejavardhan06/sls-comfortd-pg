// Produce the upload folder without original media, dependencies, or browser checks.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive:true });
for (const name of ['index.html', 'styles.css', 'css', 'js', 'fonts', 'vendor', 'media']) {
  fs.cpSync(path.join(root, name), path.join(output, name), { recursive:true });
}
console.log('Ready to upload: dist/');
