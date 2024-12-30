const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconSizes = [16, 24, 32, 512];
const sourceDir = path.join(__dirname, '../src/assets/icons');
const svgFiles = fs.readdirSync(sourceDir).filter(file => file.endsWith('.svg'));

for (const svgFile of svgFiles) {
    const baseName = path.basename(svgFile, '.svg');
    const svgPath = path.join(sourceDir, svgFile);

    for (const size of iconSizes) {
        const outputName = `${baseName}-${size}.png`;
        const outputPath = path.join(sourceDir, outputName);

        sharp(svgPath)
            .resize(size, size)
            .png()
            .toFile(outputPath)
            .then(() => {
                console.log(`Converted ${svgFile} to ${outputName}`);
            })
            .catch(err => {
                console.error(`Failed to convert ${svgFile}:`, err);
            });
    }
} 