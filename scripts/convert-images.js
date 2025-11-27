import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, parse } from 'path';

const INPUT_DIR = './static/images';
const QUALITY = 80;

async function convertImages() {
  console.log('🎨 Converting images to WebP and AVIF...\n');

  const files = await readdir(INPUT_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png'));

  console.log(`Found ${pngFiles.length} PNG images\n`);

  let converted = 0;

  for (const file of pngFiles) {
    const inputPath = join(INPUT_DIR, file);
    const { name } = parse(file);

    try {
      // Convert to WebP
      const webpPath = join(INPUT_DIR, `${name}.webp`);
      await sharp(inputPath)
        .webp({ quality: QUALITY })
        .toFile(webpPath);

      // Convert to AVIF
      const avifPath = join(INPUT_DIR, `${name}.avif`);
      await sharp(inputPath)
        .avif({ quality: QUALITY })
        .toFile(avifPath);

      converted++;
      console.log(`✓ ${name}: PNG → WebP + AVIF`);
    } catch (error) {
      console.error(`✗ ${name}: ${error.message}`);
    }
  }

  console.log(`\n🎉 Converted ${converted}/${pngFiles.length} images!`);
  console.log(`\nFormats created:`);
  console.log(`  - WebP (80% quality)`);
  console.log(`  - AVIF (80% quality)`);
  console.log(`  - PNG (original - kept as fallback)`);
}

convertImages().catch(console.error);
