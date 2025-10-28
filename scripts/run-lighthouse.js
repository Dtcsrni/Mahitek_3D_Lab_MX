#!/usr/bin/env node
const { spawn } = require('node:child_process');
const { executablePath } = require('puppeteer');

(async () => {
  try {
    const chromePath = executablePath();
    if (!chromePath) {
      throw new Error('No se pudo resolver la ruta del ejecutable de Chromium proporcionado por Puppeteer.');
    }

    const defaultFlags = '--no-sandbox --disable-dev-shm-usage';
    const normalizeFlags = value =>
      value
        .split(/\s+/)
        .filter(Boolean)
        .filter((flag, index, arr) => arr.indexOf(flag) === index)
        .join(' ');

    const chromiumFlags = [process.env.LHCI_CHROMIUM_FLAGS, defaultFlags]
      .filter(Boolean)
      .join(' ');

    const chromeFlags = [process.env.LHCI_CHROME_FLAGS, defaultFlags]
      .filter(Boolean)
      .join(' ');

    const env = {
      ...process.env,
      CHROME_PATH: chromePath,
      LHCI_CHROMIUM_FLAGS: normalizeFlags(chromiumFlags),
      LHCI_CHROME_FLAGS: normalizeFlags(chromeFlags),
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
