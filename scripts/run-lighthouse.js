#!/usr/bin/env node
const { spawn } = require('node:child_process');
const { executablePath } = require('puppeteer');

(async () => {
  try {
    const chromePath = executablePath();
    if (!chromePath) {
      throw new Error('No se pudo resolver la ruta del ejecutable de Chromium proporcionado por Puppeteer.');
    }

    const env = {
      ...process.env,
      CHROME_PATH: chromePath,
      LHCI_CHROME_FLAGS: `${process.env.LHCI_CHROME_FLAGS || ''} --no-sandbox --disable-dev-shm-usage`.trim(),
    };

    const lhciCli = require.resolve('@lhci/cli/src/cli.js');
    const child = spawn(process.execPath, [lhciCli, 'autorun'], {
      stdio: 'inherit',
      env,
    });

    child.on('exit', code => {
      process.exit(code ?? 1);
    });
  } catch (error) {
    console.error('[lighthouse] Error al lanzar Chrome con Puppeteer:', error.message);
    process.exit(1);
  }
})();
