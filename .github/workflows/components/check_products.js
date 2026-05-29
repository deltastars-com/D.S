
const fs = require('fs');
const content = fs.readFileSync('components/lib/vip/products.ts', 'utf8');
const match = content.match(/const rawJsonData = (\[[\s\S]*?\]);/);
if (match) {
    const data = eval(match[1]);
    console.log('Total items:', data.length);
    console.log('Last item ID:', data[data.length - 1].id);
    console.log('Categories:', [...new Set(data.map(i => i.category))]);
} else {
    console.log('Could not find rawJsonData');
}
