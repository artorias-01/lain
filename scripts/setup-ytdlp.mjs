import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const binDir = path.join(projectRoot, 'bin');

const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const targetPath = path.join(binDir, binaryName);

async function setup() {
  // 1. Check if binary already exists in bin/
  if (fs.existsSync(targetPath)) {
    console.log(`[setup-ytdlp] Binary already present at ${targetPath}`);
    return;
  }

  // 2. Check if yt-dlp is available in PATH
  try {
    const cmd = isWindows ? 'where.exe yt-dlp' : 'which yt-dlp';
    execSync(cmd, { stdio: 'ignore' });
    console.log('[setup-ytdlp] System yt-dlp detected in PATH');
    return;
  } catch (e) {
    // Not in PATH, proceed to download
  }

  // 3. Download standalone yt-dlp binary
  console.log(`[setup-ytdlp] Downloading ${binaryName}...`);
  fs.mkdirSync(binDir, { recursive: true });

  const downloadUrl = isWindows
    ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
    : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

  const res = await fetch(downloadUrl, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`Failed to download yt-dlp from ${downloadUrl} (${res.status} ${res.statusText})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));

  if (!isWindows) {
    fs.chmodSync(targetPath, 0o755);
  }

  console.log(`[setup-ytdlp] Successfully installed ${binaryName} to ${targetPath}`);
}

setup().catch((err) => {
  console.warn('[setup-ytdlp] Notice:', err.message);
});
