import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { gzipSync } from "bun";

// 🚀 Import des pages React
import HomePage from "../app/(pages)/page";
import AboutPage from "../app/(pages)/about/page";
import UsersPage from "../app/(pages)/users/page";
import UserPage from "../app/(pages)/users/[id]/page";

// Import des routes API
import helloRoute from "../app/api/hello/route";
import usersRoute from "../app/api/users/route";
import userByIdRoute from "../app/api/users/[id]/route";

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

// 🚀 Configuration des routes manuelles
function setupRoutes() {
  console.log("🔧 Setting up manual routes...");

  // 📄 Routes de pages avec SSR
  setupPageRoutes();

  // 🔗 Routes API
  setupApiRoutes();

  console.log("✅ All manual routes configured");
}

// 📄 Configuration des routes de pages
function setupPageRoutes() {
  // Page d'accueil
  app.get("/", async (c) => {
    const pageElement = createElement(HomePage);
    const content = renderToString(pageElement);
    const html = htmlTemplate(content, "BHR Framework - Home", "/");
    return c.html(html);
  });

  // Page à propos
  app.get("/about", async (c) => {
    const pageElement = createElement(AboutPage);
    const content = renderToString(pageElement);
    const html = htmlTemplate(content, "BHR Framework - About", "/about");
    return c.html(html);
  });

  // Page utilisateurs
  app.get("/users", async (c) => {
    const pageElement = createElement(UsersPage);
    const content = renderToString(pageElement);
    const html = htmlTemplate(content, "BHR Framework - Users", "/users");
    return c.html(html);
  });

  // Page utilisateur dynamique
  app.get("/users/:id", async (c) => {
    const id = c.req.param("id");
    const pageElement = createElement(UserPage, { params: { id } });
    const content = renderToString(pageElement);
    const html = htmlTemplate(
      content,
      `BHR Framework - User ${id}`,
      `/users/${id}`
    );
    return c.html(html);
  });
}

// 🔗 Configuration des routes API
function setupApiRoutes() {
  // Route API hello
  app.route("/api/hello", helloRoute);

  // Routes API users
  app.route("/api/users", usersRoute);
  app.route("/api/users/:id", userByIdRoute);
}

// 🎨 Template HTML optimisé
function htmlTemplate(content: string, title: string, route: string): string {
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
}

// 🚀 Initialisation du serveur BHR
const port = 3000;
console.log(`🚀 Serveur BHR démarré sur http://localhost:${port}`);
console.log(`📁 Architecture unifiée : Hono + React SSR`);

// Configurer les routes manuelles
setupRoutes();

// 📊 Middleware pour les fichiers statiques (priorité basse)
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

console.log(`✅ Serveur prêt et en écoute sur le port ${port}`);

// Exports pour le file router
export { htmlTemplate };

// Export direct pour Bun
export default {
  port,
  fetch: app.fetch,
};
