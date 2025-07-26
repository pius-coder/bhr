import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { gzipSync } from "bun";

// 🚀 Import du file router BHR
import { createFileRouter } from "./lib/file-router";

// Import des pages React (fallback si file router échoue)
import HomePage from "../app/(pages)/page";
import AboutPage from "../app/(pages)/about/page";

// Import des routes API (fallback)
import helloRoute from "../app/api/hello/route";

const app = new Hono();

// 🗜️ Middleware de compression intelligente avec Bun
app.use("*", async (c, next) => {
  await next();

  const acceptEncoding = c.req.header("Accept-Encoding");
  const contentType = c.res.headers.get("Content-Type") || "";

  // Vérifier si la compression est supportée et appropriée
  if (
    acceptEncoding?.includes("gzip") &&
    c.res.body &&
    shouldCompress(contentType)
  ) {
    try {
      const body = await c.res.text();

      // Seuil intelligent basé sur le type de contenu
      const threshold = getCompressionThreshold(contentType);

      if (body.length > threshold) {
        const start = Date.now();
        const compressed = gzipSync(body);
        const compressionTime = Date.now() - start;

        // Calculer le ratio de compression
        const ratio = (
          ((body.length - compressed.length) / body.length) *
          100
        ).toFixed(1);

        c.res = new Response(compressed, {
          status: c.res.status,
          headers: {
            ...Object.fromEntries(c.res.headers.entries()),
            "Content-Encoding": "gzip",
            "Content-Length": compressed.length.toString(),
            "X-Compression-Ratio": `${ratio}%`,
            "X-Compression-Time": `${compressionTime}ms`,
            "X-Original-Size": body.length.toString(),
          },
        });

        // Log des métriques de compression
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `🗜️ Compressed ${body.length}B → ${compressed.length}B (${ratio}%) in ${compressionTime}ms`
          );
        }
      }
    } catch (error) {
      console.warn("❌ Compression failed:", error);
    }
  }
});

// 🔧 Fonctions utilitaires pour la compression
function shouldCompress(contentType: string): boolean {
  const compressibleTypes = [
    "text/html",
    "text/css",
    "text/javascript",
    "application/javascript",
    "application/json",
    "text/xml",
    "application/xml",
    "text/plain",
  ];

  return compressibleTypes.some((type) => contentType.includes(type));
}

function getCompressionThreshold(contentType: string): number {
  // Seuils optimisés par type de contenu
  if (contentType.includes("text/html")) return 512; // HTML plus agressif
  if (contentType.includes("application/json")) return 256; // JSON très agressif
  if (contentType.includes("text/css")) return 512;
  if (contentType.includes("javascript")) return 1024;

  return 1024; // Défaut
}

// 🚀 Initialisation du File Router BHR
async function initializeFileRouter() {
  try {
    console.log("🔍 Scanning file-based routes...");

    const fileRouter = await createFileRouter(app, {
      pagesDir: "./app/(pages)",
      apiDir: "./app/api",
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      enableHotReload: process.env.NODE_ENV === "development",
      verbose: true,
    });

    console.log("✅ File-based routing initialized successfully");
    return fileRouter;
  } catch (error) {
    console.error("❌ File router initialization failed:", error);
    console.log("🔄 Falling back to manual routes...");

    // Fallback vers les routes manuelles
    setupFallbackRoutes();
    return null;
  }
}

// 🔄 Routes de fallback en cas d'échec du file router
function setupFallbackRoutes() {
  console.log("🔧 Setting up fallback routes...");

  // Routes API de fallback
  app.route("/api/hello", helloRoute);

  // Routes de pages de fallback
  setupFallbackPageRoutes();

  console.log("✅ All fallback routes configured");
}

// 🎨 Template HTML ultra-optimisé avec métriques et preload intelligent
const htmlTemplate = (
  content: string,
  title: string = "BHR App",
  route: string = "/"
) => {
  const timestamp = Date.now();
  const buildId = `bhr-${timestamp}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="BHR Framework v1.0.0">
  <meta name="build-id" content="${buildId}">

  <title>${title}</title>
  <meta name="description" content="BHR - Architecture unifiée Bun + Hono + React pour des performances optimales">

  <!-- 🚀 Preload critique pour performance -->
  <link rel="modulepreload" href="/client.js" as="script">
  <link rel="preconnect" href="//localhost:3000" crossorigin>
  <link rel="dns-prefetch" href="//api.example.com">

  <!-- 🎯 Resource hints pour optimisation -->
  <meta http-equiv="x-dns-prefetch-control" content="on">
  <link rel="prefetch" href="/about" as="document">

  <!-- 📊 Performance monitoring setup -->
  <script>
    window.__BHR_PERFORMANCE__ = {
      navigationStart: performance.now(),
      buildId: "${buildId}",
      route: "${route}",
      framework: "BHR"
    };

    // Marquer le début du SSR
    performance.mark('bhr-ssr-start');
  </script>

  <!-- 🎨 Critical CSS inline pour éviter FOUC -->
  <style>
    /* Reset et base */
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:20px;background:#f5f5f5;line-height:1.6}

    /* Layout critique */
    .container{max-width:800px;margin:0 auto;background:#fff;padding:40px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}

    /* Performance optimizations */
    #root{min-height:100vh;contain:layout style paint}

    /* Loading states */
    .loading{opacity:0.7;pointer-events:none}
    .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}

    @keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}

    /* Responsive */
    @media(max-width:768px){
      body{padding:10px}
      .container{padding:20px}
    }
  </style>
</head>
<body>
  <div id="root" data-server-rendered="true" data-hydration-boundary>${content}</div>

  <!-- 📊 Performance measurement -->
  <script>
    performance.mark('bhr-ssr-end');
    performance.measure('BHR-SSR-Render', 'bhr-ssr-start', 'bhr-ssr-end');

    // Log SSR performance
    const ssrMeasure = performance.getEntriesByName('BHR-SSR-Render')[0];
    if (ssrMeasure) {
      console.log('🎯 SSR Render:', ssrMeasure.duration.toFixed(2) + 'ms');
      window.__BHR_PERFORMANCE__.ssrRender = ssrMeasure.duration;
    }
  </script>

  <!-- 🚀 Client hydration -->
  <script type="module" src="/client.js"></script>

  <!-- 📈 Web Vitals monitoring -->
  <script>
    // Monitor Core Web Vitals
    function reportWebVital(metric) {
      console.log('📊', metric.name + ':', metric.value.toFixed(2) + metric.unit);

      // Send to analytics (en production)
      if (typeof gtag !== 'undefined') {
        gtag('event', metric.name, {
          value: Math.round(metric.value),
          metric_id: metric.id,
          custom_parameter: window.__BHR_PERFORMANCE__.buildId
        });
      }
    }

    // Import web-vitals si disponible
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import('https://unpkg.com/web-vitals@3/dist/web-vitals.js')
          .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(reportWebVital);
            getFID(reportWebVital);
            getFCP(reportWebVital);
            getLCP(reportWebVital);
            getTTFB(reportWebVital);
          })
          .catch(() => console.log('Web Vitals not available'));
      });
    }
  </script>
</body>
</html>`;
};

// 🔄 Ajouter les routes de pages de fallback à la fonction
function setupFallbackPageRoutes() {
  console.log("🔧 Setting up fallback page routes...");

  // 🏠 Route pour la page d'accueil
  app.get("/", (c) => {
    try {
      const html = renderToString(createElement(HomePage));
      return c.html(htmlTemplate(html, "Accueil - BHR", "/"));
    } catch (error) {
      console.error("Erreur lors du rendu de la page d'accueil:", error);
      return c.html(
        htmlTemplate("<h1>Erreur de rendu</h1>", "Erreur - BHR", "/")
      );
    }
  });

  // 📄 Route pour la page About
  app.get("/about", (c) => {
    try {
      const html = renderToString(createElement(AboutPage));
      return c.html(htmlTemplate(html, "À propos - BHR", "/about"));
    } catch (error) {
      console.error("Erreur lors du rendu de la page About:", error);
      return c.html(
        htmlTemplate("<h1>Erreur de rendu</h1>", "Erreur - BHR", "/about")
      );
    }
  });

  console.log("✅ Fallback page routes configured");
}

// � Middleware pour les fichiers statiques (priorité basse)
app.use(
  "/*",
  serveStatic({
    root: "./dist/public",
    onNotFound: (path) => {
      console.log(`Static file not found: ${path}`);
      return undefined; // Continue to next middleware
    },
  })
);

app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));

// �🚀 Démarrage du serveur
// 🚀 Initialisation du file router au démarrage
const port = 3000;
console.log(`🚀 Serveur BHR démarré sur http://localhost:${port}`);
console.log(`📁 Architecture unifiée : Hono + React SSR`);

// Initialiser le file router de manière asynchrone
initializeFileRouter()
  .then(() => {
    console.log(`✅ Serveur prêt et en écoute sur le port ${port}`);
  })
  .catch((error) => {
    console.error("❌ Erreur lors de l'initialisation du file router:", error);
  });

// Exports pour le file router
export { htmlTemplate };

// Export direct pour Bun
export default {
  port,
  fetch: app.fetch,
};
