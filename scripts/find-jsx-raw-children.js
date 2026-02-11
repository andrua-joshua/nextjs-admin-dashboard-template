const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fp));
    } else if (fp.endsWith('.tsx') || fp.endsWith('.jsx')) {
      results.push(fp);
    }
  });
  return results;
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const regex = />\s*{\s*([^}]+)\s*}\s*</;
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(regex);
    if (m) {
      const inner = m[1].trim();
      // ignore common benign identifiers like children or expressions containing dot/paren
      if (inner === 'children') continue;
      // ignore if it's clearly an expression or property access or literal
      if (inner.includes('.') || inner.includes('(') || inner.includes('=>') || inner.includes('[') || inner.includes('`') || inner.includes('"') || inner.includes("'")) continue;
      // likely a single identifier — report it
      matches.push({ line: i+1, identifier: inner, text: line.trim() });
    }
  }
  return matches;
}

const root = path.join(__dirname, '..', 'src');
if (!fs.existsSync(root)) {
  console.error('src/app not found');
  process.exit(1);
}

const files = walk(root);
let total = 0;
files.forEach((f) => {
  const matches = scanFile(f);
  if (matches.length) {
    console.log('---', f);
    matches.forEach(m => {
      console.log(` L${m.line}: ${m.text}`);
    });
    total += matches.length;
  }
});
console.log('Done. Matches found:', total);
