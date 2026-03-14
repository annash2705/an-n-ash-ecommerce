const Jimp = require('jimp');

async function process() {
    const image = await Jimp.read('public/logo.jpg');

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        // The background is black, text is gold. Let's make anything very dark transparent.
        // Allow keeping the original gold color as is.
        const isBackground = r < 30 && g < 30 && b < 30;

        if (isBackground) {
            this.bitmap.data[idx + 3] = 0; // Fully transparent
        } else {
            // We'll keep the original color of the image, but we can do some edge smoothing
            // based on luminance.
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            let alpha = 255;

            // If it's a very dark gray edge, fade it out
            if (lum < 50) {
                alpha = Math.floor((lum / 50) * 255);
            }

            this.bitmap.data[idx + 3] = alpha;
        }
    });

    // Optional: Trim excess transparent borders automatically
    image.autocrop();

    await image.writeAsync('public/logo-gold.png');
    console.log("Processed logo saved to public/logo-gold.png");
}

process().catch(console.error);
