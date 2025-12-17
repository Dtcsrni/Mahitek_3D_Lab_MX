#!/usr/bin/env node
/**
 * Validación de docs con modo local/CI:
 * - Local: auto-regenera `ANALISIS_SISTEMA.md` y luego verifica.
 * - CI: solo verifica (no modifica workspace).
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function runNode(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  return result.status ?? 1;
}

function tryGitAddAnalysis() {
  const git = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if ((git.status ?? 1) !== 0) return;

  spawnSync("git", ["add", "ANALISIS_SISTEMA.md"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

const isCI =
  process.env.CI === "true" ||
  process.env.GITHUB_ACTIONS === "true" ||
  process.env.BUILDKITE === "true";

if (!isCI) {
  const genStatus = runNode(path.join(repoRoot, "scripts", "generate-analisis-sistema.js"));
  if (genStatus !== 0) process.exit(genStatus);
  // Evita que se "olvide" el archivo: lo deja staged si cambió.
  tryGitAddAnalysis();
}

const checkStatus = runNode(path.join(repoRoot, "scripts", "check-analisis-sistema.js"));
process.exit(checkStatus);
