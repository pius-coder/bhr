/**
 * 🛠️ BHR Route Utilities
 * Utilitaires pour le système de routing file-based
 * Inspiré des meilleures pratiques de Next.js et Hono
 */

import type { Context } from "hono";

// 📊 Types pour les paramètres de route
export interface RouteParams {
  [key: string]: string | string[];
}

export interface ParsedRoute {
  segments: RouteSegment[];
  params: string[];
  isDynamic: boolean;
  isWildcard: boolean;
}

export interface RouteSegment {
  type: "static" | "dynamic" | "wildcard" | "group";
  value: string;
  param?: string;
}

// 🎯 Conventions de fichiers Next.js-like
export const FILE_CONVENTIONS = {
  PAGE: "page",
  ROUTE: "route",
  LAYOUT: "layout",
  LOADING: "loading",
  ERROR: "error",
  NOT_FOUND: "not-found",
  MIDDLEWARE: "_middleware",
  GLOBAL_ERROR: "global-error",
} as const;

// 🔧 Extensions supportées
export const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"] as const;

/**
 * 🔍 Parser un chemin de fichier en route
 */
export function parseFilePath(filePath: string): ParsedRoute {
  const segments: RouteSegment[] = [];
  const params: string[] = [];
  let isDynamic = false;
  let isWildcard = false;

  // Nettoyer le chemin
  const cleanPath = filePath
    .replace(/\\/g, "/")
    .replace(/\.(ts|tsx|js|jsx)$/, "")
    .replace(/\/(page|route|layout)$/, "");

  // Diviser en segments
  const pathSegments = cleanPath.split("/").filter(Boolean);

  for (const segment of pathSegments) {
    if (segment.startsWith("(") && segment.endsWith(")")) {
      // Route group - ignore dans l'URL finale
      segments.push({
        type: "group",
        value: segment.slice(1, -1),
      });
    } else if (segment.startsWith("[") && segment.endsWith("]")) {
      const paramContent = segment.slice(1, -1);

      if (paramContent.startsWith("...")) {
        // Catch-all route [...slug]
        const param = paramContent.slice(3);
        segments.push({
          type: "wildcard",
          value: segment,
          param,
        });
        params.push(param);
        isWildcard = true;
        isDynamic = true;
      } else {
        // Dynamic route [id]
        segments.push({
          type: "dynamic",
          value: segment,
          param: paramContent,
        });
        params.push(paramContent);
        isDynamic = true;
      }
    } else {
      // Static segment
      segments.push({
        type: "static",
        value: segment,
      });
    }
  }

  return {
    segments,
    params,
    isDynamic,
    isWildcard,
  };
}

/**
 * 🛣️ Convertir un chemin de fichier en route Hono
 */
export function filePathToRoute(filePath: string): string {
  const parsed = parseFilePath(filePath);

  const routeSegments = parsed.segments
    .filter((segment) => segment.type !== "group") // Ignorer les groupes
    .map((segment) => {
      switch (segment.type) {
        case "dynamic":
          return `:${segment.param}`;
        case "wildcard":
          return `*${segment.param}`;
        case "static":
        default:
          return segment.value;
      }
    });

  const route = "/" + routeSegments.join("/");

  // Nettoyer la route
  return route === "/" ? "/" : route.replace(/\/$/, "");
}

/**
 * 📊 Calculer la priorité d'une route
 */
export function calculateRoutePriority(route: string): number {
  let priority = 1000;

  // Segments statiques ont plus de priorité
  const segments = route.split("/").filter(Boolean);
  priority += segments.length * 10;

  // Réduire la priorité pour les paramètres dynamiques
  const dynamicParams = (route.match(/:/g) || []).length;
  priority -= dynamicParams * 100;

  // Réduire encore plus pour les wildcards
  const wildcards = (route.match(/\*/g) || []).length;
  priority -= wildcards * 200;

  return priority;
}

/**
 * 🎭 Créer un handler de page avec SSR
 */
export function createPageHandler(PageComponent: any, routePath: string) {
  return async (c: Context) => {
    try {
      // Récupérer les paramètres
      const params = c.req.param();
      const query = c.req.query();

      // Props pour le composant
      const pageProps = {
        params,
        searchParams: query,
      };

      // Rendu SSR
      const { renderToString } = await import("react-dom/server");
      const { createElement } = await import("react");

      const pageElement = createElement(PageComponent, pageProps);
      const content = renderToString(pageElement);

      // Template HTML avec métriques
      const title = `BHR App${routePath !== "/" ? ` - ${routePath}` : ""}`;
      const html = await generateHTMLTemplate(content, title, routePath);

      return c.html(html);
    } catch (error) {
      console.error(`❌ Error rendering page ${routePath}:`, error);
      return c.text("Internal Server Error", 500);
    }
  };
}

/**
 * 🎨 Générer le template HTML optimisé
 */
export async function generateHTMLTemplate(
  content: string,
  title: string,
  route: string
): Promise<string> {
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
  
  <!-- 🚀 Preload critique -->
  <link rel="modulepreload" href="/client.js" as="script">
  <link rel="preconnect" href="//localhost:3000" crossorigin>
  
  <!-- 📊 Performance monitoring -->
  <script>
    window.__BHR_PERFORMANCE__ = {
      navigationStart: performance.now(),
      buildId: "${buildId}",
      route: "${route}",
      framework: "BHR"
    };
    performance.mark('bhr-ssr-start');
  </script>
  
  <!-- 🎨 Critical CSS -->
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:20px;background:#f5f5f5;line-height:1.6}
    .container{max-width:800px;margin:0 auto;background:#fff;padding:40px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
    #root{min-height:100vh;contain:layout style paint}
    .loading{opacity:0.7;pointer-events:none}
    @media(max-width:768px){body{padding:10px}.container{padding:20px}}
  </style>
</head>
<body>
  <div id="root" data-server-rendered="true" data-route="${route}">${content}</div>
  
  <script>
    performance.mark('bhr-ssr-end');
    performance.measure('BHR-SSR-Render', 'bhr-ssr-start', 'bhr-ssr-end');
    const ssrMeasure = performance.getEntriesByName('BHR-SSR-Render')[0];
    if (ssrMeasure) {
      console.log('🎯 SSR Render:', ssrMeasure.duration.toFixed(2) + 'ms');
      window.__BHR_PERFORMANCE__.ssrRender = ssrMeasure.duration;
    }
  </script>
  
  <script type="module" src="/client.js"></script>
</body>
</html>`;
}

/**
 * 🛡️ Créer un middleware de validation
 */
export function createValidationMiddleware(schema: any) {
  return async (c: Context, next: any) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      c.set("validatedData", validated);
      await next();
    } catch (error) {
      return c.json({ error: "Validation failed", details: error }, 400);
    }
  };
}

/**
 * 📝 Logger pour les routes
 */
export function createRouteLogger(routePath: string) {
  return async (c: Context, next: any) => {
    const start = Date.now();
    const method = c.req.method;

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    console.log(`🛣️  ${method} ${routePath} → ${status} (${duration}ms)`);
  };
}

/**
 * 🔍 Détecter le type de fichier
 */
export function getFileType(
  fileName: string
): keyof typeof FILE_CONVENTIONS | null {
  const baseName = fileName.replace(/\.(ts|tsx|js|jsx)$/, "");

  for (const [key, value] of Object.entries(FILE_CONVENTIONS)) {
    if (baseName === value || baseName.endsWith(`/${value}`)) {
      return key as keyof typeof FILE_CONVENTIONS;
    }
  }

  return null;
}

/**
 * 🎯 Matcher de routes avancé
 */
export class RouteMatcher {
  private routes: Map<string, { pattern: RegExp; params: string[] }> =
    new Map();

  addRoute(path: string): void {
    const params: string[] = [];

    // Convertir le chemin en regex
    const pattern = path
      .replace(/\//g, "\\/")
      .replace(/:([^\/]+)/g, (_, param) => {
        params.push(param);
        return "([^/]+)";
      })
      .replace(/\*([^\/]*)/g, (_, param) => {
        if (param) params.push(param);
        return "(.*)";
      });

    this.routes.set(path, {
      pattern: new RegExp(`^${pattern}$`),
      params,
    });
  }

  match(path: string): { route: string; params: RouteParams } | null {
    for (const [routePath, { pattern, params }] of this.routes.entries()) {
      const match = path.match(pattern);
      if (match) {
        const routeParams: RouteParams = {};

        for (let i = 0; i < params.length; i++) {
          const param = params[i];
          const value = match[i + 1];

          // Handle catch-all routes
          if (routePath.includes(`*${param}`)) {
            routeParams[param] = value.split("/").filter(Boolean);
          } else {
            routeParams[param] = value;
          }
        }

        return { route: routePath, params: routeParams };
      }
    }

    return null;
  }
}

/**
 * 🚀 Utilitaires d'export
 */
export const RouteUtils = {
  parseFilePath,
  filePathToRoute,
  calculateRoutePriority,
  createPageHandler,
  createValidationMiddleware,
  createRouteLogger,
  getFileType,
  RouteMatcher,
};

export default RouteUtils;
