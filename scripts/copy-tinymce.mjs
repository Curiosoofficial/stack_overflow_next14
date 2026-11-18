// Kopiert den TinyMCE-Editor aus node_modules nach public/tinymce.
// So wird der Editor von der eigenen Domain geladen und braucht keinen
// API-Key und keine "Approved Domains" bei tiny.cloud.
// Läuft automatisch nach "npm install" (postinstall), auch auf Vercel.

import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "tinymce");
const target = join(root, "public", "tinymce");

if (!existsSync(source)) {
  console.warn("TinyMCE nicht gefunden (node_modules/tinymce), Kopieren übersprungen.");
  process.exit(0);
}

rmSync(target, { recursive: true, force: true });

for (const folder of ["icons", "models", "plugins", "skins", "themes"]) {
  cpSync(join(source, folder), join(target, folder), { recursive: true });
}
cpSync(join(source, "tinymce.min.js"), join(target, "tinymce.min.js"));
cpSync(join(source, "license.md"), join(target, "license.md"));

console.log("TinyMCE nach public/tinymce kopiert.");
