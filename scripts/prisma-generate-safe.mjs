import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cleanStalePrismaTmpFiles() {
  const prismaDir = path.join(process.cwd(), "node_modules", ".prisma", "client");

  try {
    const entries = await fs.readdir(prismaDir);
    const stale = entries.filter(
      (name) =>
        /query_engine-windows\.(dll\.node|exe)\.tmp\d+$/i.test(name) ||
        /libquery_engine.*\.tmp\d+$/i.test(name)
    );

    await Promise.all(stale.map((name) => fs.unlink(path.join(prismaDir, name))));

    if (stale.length > 0) {
      console.log(`Removed ${stale.length} stale Prisma temp file(s).`);
    }
  } catch (error) {
    // Ignore missing directory; generation will recreate as needed.
    if (error && error.code !== "ENOENT") {
      console.warn("Could not clean Prisma temp files:", error.message);
    }
  }
}

function runPrismaGenerate() {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";

  return spawnSync(command, ["prisma", "generate"], {
    encoding: "utf8",
    stdio: "pipe",
  });
}

function isRetryablePrismaLockError(resultText) {
  return /EPERM: operation not permitted, rename/i.test(resultText) &&
    /query_engine/i.test(resultText);
}

async function main() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    await cleanStalePrismaTmpFiles();

    const result = runPrismaGenerate();
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);

    if (result.status === 0) return;

    const output = [
      result.stdout || "",
      result.stderr || "",
      result.error?.message || "",
    ].join("\n");

    if (attempt < MAX_RETRIES && isRetryablePrismaLockError(output)) {
      console.warn(
        `Prisma engine lock detected (attempt ${attempt}/${MAX_RETRIES}). Retrying...`
      );
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    process.exit(result.status || 1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
