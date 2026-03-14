const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\SANDESH\\.gemini\\antigravity\\brain\\3d2aff23-f846-48ff-a29f-819fd0c15016';

async function analyze() {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    for (const f of files) {
        const fullPath = path.join(dir, f);
        try {
            const image = await Jimp.read(fullPath);
            // check top left pixel color to guess background
            const r = image.bitmap.data[0];
            const g = image.bitmap.data[1];
            const b = image.bitmap.data[2];
            console.log(`File: ${f}, Top-Left Pixel RGB: (${r},${g},${b}), Dimensions: ${image.bitmap.width}x${image.bitmap.height}`);
        } catch (e) {
            console.log(`Could not read ${f}`);
        }
    }
}
analyze();
