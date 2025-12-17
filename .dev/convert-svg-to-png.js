const sharp = require('sharp');
const fs = require('fs');

console.log('🎨 Mahitek 3D Lab - OG Image Converter\n');

const svgBuffer = fs.readFileSync('.dev/og-image.svg');

sharp(svgBuffer)
  .resize(1200, 630)
  .png({ quality: 100, compressionLevel: 9 })
  .toFile('assets/img/og-image.png')
  .then(info => {
    console.log('✅ PNG generado exitosamente');
    console.log(`📏 Dimensiones: ${info.width}x${info.height}`);
    console.log(`💾 Tamaño: ${(info.size / 1024).toFixed(2)} KB`);
    console.log('\n📋 Próximos pasos:');
    console.log('git add assets/img/og-image.png');
    console.log('git commit -m "feat(seo): agregar og-image.png optimizada"');
    console.log('git push origin main');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    console.log('\n💡 Alternativa: Abre og-image-generator.html en tu navegador');
    process.exit(1);
  });
