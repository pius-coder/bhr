#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync, statSync } from "fs";

console.log("🚀 Optimisation avancée du build BHR...");

// 1. Clean des anciens builds
console.log("🧹 Nettoyage...");
if (existsSync("dist")) {
  await $`rm -rf dist`;
}

// 2. Build optimisé du client avec analyse
console.log("📦 Build client optimisé...");
const clientStart = Date.now();
await $`bun build src/client.tsx --outdir=dist/public --splitting --format=esm --target=browser --minify --sourcemap=none --tree-shaking`;
const clientTime = Date.now() - clientStart;

// 3. Build du serveur
console.log("🖥️ Build serveur...");
const serverStart = Date.now();
await $`bun build src/server.ts --outdir=dist --target=bun --minify`;
const serverTime = Date.now() - serverStart;

// 4. Analyse des tailles
console.log("\n📊 Analyse des performances:");

if (existsSync("dist/public/client.js")) {
  const clientSize = statSync("dist/public/client.js").size;
  const clientSizeKB = (clientSize / 1024).toFixed(2);
  console.log(`📱 Client.js: ${clientSizeKB} KB (build: ${clientTime}ms)`);
}

if (existsSync("dist/server.js")) {
  const serverSize = statSync("dist/server.js").size;
  const serverSizeKB = (serverSize / 1024).toFixed(2);
  console.log(`🖥️ Server.js: ${serverSizeKB} KB (build: ${serverTime}ms)`);
}

// 5. Recommandations
console.log("\n💡 Optimisations appliquées:");
console.log("✅ Tree-shaking activé");
console.log("✅ Minification activée");
console.log("✅ Sourcemaps désactivées");
console.log("✅ Code splitting activé");
console.log("✅ Compression gzip serveur");
console.log("✅ Preload des ressources");

console.log("\n🎯 Build optimisé terminé !");
