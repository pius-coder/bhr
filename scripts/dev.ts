#!/usr/bin/env bun

import { spawn } from "bun";
import { watch } from "fs";
import path from "path";

console.log("🚀 Démarrage du serveur de développement BHR...");

// Build initial du client
console.log("📦 Build initial du client...");
await Bun.spawn(["bun", "run", "build:client"]).exited;
console.log("✅ Client buildé avec succès");

// Fonction pour rebuilder le client
async function rebuildClient() {
  console.log("🔄 Rebuild du client...");
  try {
    await Bun.spawn(["bun", "run", "build:client"]).exited;
    console.log("✅ Client rebuildé avec succès");
  } catch (error) {
    console.error("❌ Erreur lors du rebuild client:", error);
  }
}

// Watcher pour les fichiers client
const clientWatcher = watch(
  path.join(process.cwd(), "src/client.tsx"),
  { recursive: false },
  (eventType, filename) => {
    if (filename && eventType === "change") {
      rebuildClient();
    }
  }
);

const appWatcher = watch(
  path.join(process.cwd(), "app"),
  { recursive: true },
  (eventType, filename) => {
    if (filename && eventType === "change" && filename.endsWith(".tsx")) {
      rebuildClient();
    }
  }
);

// Démarrer le serveur avec watch
console.log("🌐 Démarrage du serveur...");
const server = spawn(["bun", "run", "--watch", "src/server.ts"], {
  stdio: ["inherit", "inherit", "inherit"],
});

// Gestion de l'arrêt propre
process.on("SIGINT", () => {
  console.log("\n🛑 Arrêt du serveur de développement...");
  clientWatcher.close();
  appWatcher.close();
  server.kill();
  process.exit(0);
});
