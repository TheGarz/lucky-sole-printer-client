const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const pngSizes = [16, 24, 32, 48, 64, 128, 256, 512];
const icoSizes = [16, 24, 32, 48, 64, 128, 256]; // ICO format doesn't support 512px
const iconsDir = path.join(__dirname, '../src/assets/icons');
const outputDir = path.join(__dirname, '../src/assets/icons');

async function convertSvgToPng(svgPath, size) {
  const filename = path.basename(svgPath, '.svg');
  const outputPath = path.join(outputDir, `${filename}-${size}.png`);
  
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`Generated ${outputPath}`);
  return outputPath;
}

async function generateIco(svgPath) {
  const filename = path.basename(svgPath, '.svg');
  const pngFiles = [];
  
  // Generate PNGs for ICO sizes
  for (const size of icoSizes) {
    const pngPath = await convertSvgToPng(svgPath, size);
    pngFiles.push({ size, path: pngPath });
  }
  
  // Create ICO file
  const icoPath = path.join(outputDir, `${filename}.ico`);
  const toIco = require('to-ico');
  const images = await Promise.all(pngFiles.map(async file => {
    return fs.promises.readFile(file.path);
  }));
  
  const ico = await toIco(images);
  await fs.promises.writeFile(icoPath, ico);
  console.log(`Generated ${icoPath}`);
  
  // Generate additional PNG sizes that aren't included in ICO
  for (const size of pngSizes) {
    if (!icoSizes.includes(size)) {
      await convertSvgToPng(svgPath, size);
    }
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all SVG files
  const files = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));
  
  for (const file of files) {
    const svgPath = path.join(iconsDir, file);
    await generateIco(svgPath);
  }
}

main().catch(console.error); 