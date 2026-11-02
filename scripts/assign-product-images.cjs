const fs = require('fs');
const path = require('path');

const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

// Primary image (unique per product) + 2 shared secondary images.
const MAP = {
  'ca-phe-arabica-cau-dat-da-lat': ['1447933601403-0c6688de566e', '1498804103079-a6351b050096', '1530041539828-114de669390e'],
  'ca-phe-robusta-buon-ma-thuot':  ['1580933073521-dc49ac0d4e6a', '1514432324607-a09d9b4aefdd', '1442975631115-c4f7b05b8a2c'],
  'ca-phe-blend-house-special':      ['1495474472287-4d71bcdd2085', '1509042239860-f550ce710b93', '1511920170033-f8396924c348'],
  'ca-phe-arabica-honey-process':    ['1530041539828-114de669390e', '1498804103079-a6351b050096', '1497515114629-f71d768fd07c'],
  'ca-phe-robusta-honey':            ['1442975631115-c4f7b05b8a2c', '1530041539828-114de669390e', '1447933601403-0c6688de566e'],
  'ca-phe-espresso-dam-da':          ['1510707577719-ae7c14805e3a', '1517701550927-30cf4ba1dba5', '1461988091159-192b6df7054f'],
  'ca-phe-geisha-premium':           ['1497515114629-f71d768fd07c', '1495474472287-4d71bcdd2085', '1501339847302-ac426a4a7cbb'],
  'ca-phe-cherry-natural':           ['1524350876685-274059332603', '1530041539828-114de669390e', '1498804103079-a6351b050096'],
  'ca-phe-xay-truyen-thong':         ['1544787219-7f47ccb76574', '1442975631115-c4f7b05b8a2c', '1518057111178-44a106bad636'],
  'ca-phe-xay-espresso':             ['1517701550927-30cf4ba1dba5', '1510707577719-ae7c14805e3a', '1461988091159-192b6df7054f'],
  'ca-phe-xay-pour-over':            ['1610632380989-680fe40816c6', '1461023058943-07fcbe16d735', '1498804103079-a6351b050096'],
  'ca-phe-xay-french-press':         ['1442550528053-c431ecb55509', '1518057111178-44a106bad636', '1599639957043-f3aa5c986398'],
  'ca-phe-xay-moka':                 ['1599639957043-f3aa5c986398', '1470324161839-ce2bb6fa6bc3', '1518057111178-44a106bad636'],
  'ca-phe-xay-cold-brew':            ['1572442388796-11668a67e53d', '1599639957043-f3aa5c986398', '1512568400610-62da28bc8a13'],
  'ca-phe-hoa-tan-3in1-classic':     ['1559056199-641a0ac8b55e', '1470324161839-ce2bb6fa6bc3', '1518057111178-44a106bad636'],
  'ca-phe-hoa-tan-den-da':           ['1507133750040-4a8f57021571', '1572442388796-11668a67e53d', '1599639957043-f3aa5c986398'],
  'ca-phe-hoa-tan-sua':              ['1509042239860-f550ce710b93', '1507133750040-4a8f57021571', '1495474472287-4d71bcdd2085'],
  'ca-phe-hoa-tan-cappuccino':       ['1512568400610-62da28bc8a13', '1509042239860-f550ce710b93', '1507133750040-4a8f57021571'],
  'ca-phe-rang-moc-truyen-thong':    ['1459755486867-b55449bb39ff', '1514432324607-a09d9b4aefdd', '1580933073521-dc49ac0d4e6a'],
  'ca-phe-rang-moc-hat':             ['1442512595331-e89e73853f31', '1447933601403-0c6688de566e', '1514432324607-a09d9b4aefdd'],
  'ca-phe-rang-moc-light-roast':     ['1497935586351-b67a49e012bf', '1530041539828-114de669390e', '1498804103079-a6351b050096'],
  'ca-phe-rang-moc-dark-roast':      ['1514432324607-a09d9b4aefdd', '1459755486867-b55449bb39ff', '1442975631115-c4f7b05b8a2c'],
  'ca-phe-rang-moc-espresso':        ['1461988091159-192b6df7054f', '1510707577719-ae7c14805e3a', '1517701550927-30cf4ba1dba5'],
  'phin-pha-ca-phe-inox':            ['1470324161839-ce2bb6fa6bc3', '1544787219-7f47ccb76574', '1518057111178-44a106bad636'],
  'may-xay-ca-phe-tay':              ['1610889556528-9a770e32642f', '1497935586351-b67a49e012bf', '1610632380989-680fe40816c6'],
  'am-pour-over-v60':                ['1461023058943-07fcbe16d735', '1610632380989-680fe40816c6', '1498804103079-a6351b050096'],
  'hop-qua-ca-phe-premium':          ['1521302080334-4bebac2763a6', '1501339847302-ac426a4a7cbb', '1511920170033-f8396924c348'],
  'hop-qua-ca-phe-classic':          ['1501339847302-ac426a4a7cbb', '1495474472287-4d71bcdd2085', '1511920170033-f8396924c348'],
};

const root = path.resolve(__dirname, '..');

// ---- backend/src/data/products.json ----
const backendFile = path.join(root, 'backend', 'src', 'data', 'products.json');
const backend = JSON.parse(fs.readFileSync(backendFile, 'utf8'));
let changed = 0;
for (const p of backend) {
  const m = MAP[p.slug];
  if (!m) { console.warn('NO MAP for', p.slug); continue; }
  p.images = m.map(U);
  changed++;
}
fs.writeFileSync(backendFile, JSON.stringify(backend, null, 2) + '\n', 'utf8');
console.log('backend products updated:', changed);

// ---- src/data/products.ts ----
const frontFile = path.join(root, 'src', 'data', 'products.ts');
let ts = fs.readFileSync(frontFile, 'utf8');
let tsChanged = 0;
for (const [slug, ids] of Object.entries(MAP)) {
  const urls = ids.map(U).join("', '");
  // Replace the images array of the product block identified by its slug.
  const slugIdx = ts.indexOf(`slug: '${slug}'`);
  if (slugIdx === -1) { console.warn('slug not found in ts:', slug); continue; }
  const imgIdx = ts.indexOf('images: [', slugIdx);
  if (imgIdx === -1 || imgIdx > slugIdx + 2000) { console.warn('images not found near', slug); continue; }
  const closeIdx = ts.indexOf(']', imgIdx);
  ts = ts.slice(0, imgIdx) + `images: ['${urls}']` + ts.slice(closeIdx + 1);
  tsChanged++;
}
fs.writeFileSync(frontFile, ts, 'utf8');
console.log('frontend products updated:', tsChanged);
