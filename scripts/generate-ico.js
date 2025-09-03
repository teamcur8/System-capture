// Generate a multi-size Windows .ico from src/assets/logo.png
// Requires devDependencies: jimp, png-to-ico

const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const pngToIco = require('png-to-ico');

async function main() {
  const srcPng = path.resolve(__dirname, '..', 'src', 'assets', 'logo.png');
  const outDir = path.resolve(__dirname, '..', 'build');
  const tmpDir = path.resolve(__dirname, '..', 'build', 'icon-src');
  const outIco = path.resolve(outDir, 'icon.ico');

  if (!fs.existsSync(srcPng)) {
    console.error('Source PNG not found:', srcPng);
    process.exit(1);
  }
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    const img = await Jimp.read(srcPng);
    img.contain(size, size, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
    img.background(0x00000000); // transparent background
    const buf = await img.getBufferAsync(Jimp.MIME_PNG);
    const outPng = path.join(tmpDir, `icon_${size}.png`);
    fs.writeFileSync(outPng, buf);
    pngBuffers.push(buf);
  }

  const ico = await pngToIco(pngBuffers);
  fs.writeFileSync(outIco, ico);
  console.log('Icon written to', outIco);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


