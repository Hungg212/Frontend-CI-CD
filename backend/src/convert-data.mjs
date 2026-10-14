// Convert products.ts / categories.ts to JSON using tsx runtime.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

const { products } = await import(pathToFileURL(path.join(root, 'src/data/products.ts')).href);
const { categories } = await import(pathToFileURL(path.join(root, 'src/data/categories.ts')).href);

const outDir = path.join(__dirname, 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(outDir, 'categories.json'), JSON.stringify(categories, null, 2));
console.log(`Wrote ${products.length} products, ${categories.length} categories`);
