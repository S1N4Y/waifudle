
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_JSON = path.join(__dirname, '../src/waifu.json');
const OUTPUT_JSON = path.join(__dirname, '../src/waifu_local.json');
const IMAGES_DIR = path.join(__dirname, '../public/characters');

// Ensure directories exist
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// User-Agent to avoid 403s
const AXIOS_CONFIG = {
    responseType: 'stream',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
};

async function downloadImage(url, filepath) {
    try {
        const response = await axios.get(url, AXIOS_CONFIG);
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Download failed: ${error.message}`);
    }
}

async function processWaifus() {
    try {
        const rawData = fs.readFileSync(SOURCE_JSON, 'utf8');
        const waifus = JSON.parse(rawData);
        const processedWaifus = [];

        console.log(`Found ${waifus.length} waifus to process.`);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < waifus.length; i++) {
            const waifu = waifus[i];
            const originalImage = waifu.image;

            // Progress log
            process.stdout.write(`Processing ${i + 1}/${waifus.length}: ${waifu.name}... `);

            if (!originalImage || !originalImage.startsWith('http')) {
                console.log('Skipping (Invalid URL)');
                processedWaifus.push(waifu);
                continue;
            }

            // Clean name for filename
            const cleanName = waifu.name.replace(/[^a-zA-Z0-9]/g, '_');

            // Determine extension (default to .png if not found)
            let ext = '.png';
            if (originalImage.includes('.jpg') || originalImage.includes('.jpeg')) ext = '.jpg';
            else if (originalImage.includes('.webp')) ext = '.webp';

            const filename = `${cleanName}${ext}`;
            const localPath = path.join(IMAGES_DIR, filename);
            const publicPath = `/characters/${filename}`;

            try {
                // Check if file already exists to avoid redownloading
                if (fs.existsSync(localPath)) {
                    // console.log('Exists');
                } else {
                    await downloadImage(originalImage, localPath);
                    // console.log('Downloaded');
                }

                // Update waifu object
                waifu.image = publicPath;
                successCount++;
                console.log('OK');
            } catch (err) {
                console.log(`❌ Error: ${err.message}`);
                // Keep original URL on error
                failCount++;
            }

            processedWaifus.push(waifu);
        }

        // Save new JSON
        fs.writeFileSync(OUTPUT_JSON, JSON.stringify(processedWaifus, null, 2));

        console.log('\n-----------------------------------');
        console.log('Processing Complete!');
        console.log(`Success: ${successCount}`);
        console.log(`Failed: ${failCount}`);
        console.log(`New JSON saved to: ${OUTPUT_JSON}`);

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

processWaifus();
