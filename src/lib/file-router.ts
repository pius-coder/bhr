/**
 * 🚀 BHR File-Based Router
 * Ultra-optimized file-based routing system inspired by Next.js App Router
 * Combines the best of kiki-kanri/auto-hono, thisjt/hono-file-router, and @inventus/hono-fbr
 *
 * Features:
 * - Next.js-like file conventions (page.tsx, route.ts, layout.tsx)
 * - Dynamic routes with [param] and [...slug] support
 * - Route groups with (group) syntax
 * - Middleware support with _middleware.ts
 * - TypeScript-first with full type inference
 * - Bun-optimized with ultra-fast scanning
 * - Hot reload support for development
 */

import { Hono } from "hono";
import { readdir } from "fs/promises";
import { join, relative, sep } from "path";
import type { Context } from "hono";

// 📊 Types pour le système de routing
export interface RouteInfo {
  path: string;
  filePath: string;
  method: string;
  handler: any;
  middleware?: any[];
  params?: string[];
  isDynamic: boolean;
  priority: number;
}

export interface LayoutInfo {
  path: string;
  filePath: string;
  component: any;
  children?: LayoutInfo[];
}

export interface FileRouterOptions {
  pagesDir: string;
  apiDir: string;
  extensions: string[];
  enableHotReload: boolean;
  verbose: boolean;
}

// 🎯 Configuration par défaut
const DEFAULT_OPTIONS: FileRouterOptions = {
  pagesDir: "./app/(pages)",
  apiDir: "./app/api",
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  enableHotReload: process.env.NODE_ENV === "development",
  verbose: process.env.NODE_ENV === "development",
};

export class BHRFileRouter {
  private app: Hono;
  private options: FileRouterOptions;
  private routes: Map<string, RouteInfo> = new Map();
  private layouts: Map<string, LayoutInfo> = new Map();
  private middleware: Map<string, any[]> = new Map();
  private watchedFiles: Set<string> = new Set();

  constructor(app: Hono, options: Partial<FileRouterOptions> = {}) {
    this.app = app;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    if (this.options.verbose) {
      console.log("🚀 BHR File Router initialized");
    }
  }

  /**
   * 🔍 Scanner les fichiers et construire les routes
   */
  async scan(): Promise<void> {
    const startTime = performance.now();

    try {
      // Scanner les API routes
      await this.scanDirectory(this.options.apiDir, "api");

      // Scanner les pages
      await this.scanDirectory(this.options.pagesDir, "pages");

      // Trier les routes par priorité
      const sortedRoutes = Array.from(this.routes.values()).sort(
        (a, b) => b.priority - a.priority
      );

      // Enregistrer les routes dans Hono
      this.registerRoutes(sortedRoutes);

      const endTime = performance.now();

      if (this.options.verbose) {
        console.log(
          `📊 Scanned ${this.routes.size} routes in ${(
            endTime - startTime
          ).toFixed(2)}ms`
        );
        this.logRoutes();
      }
    } catch (error) {
      console.error("❌ Error scanning routes:", error);
      throw error;
    }
  }

  /**
   * 📁 Scanner un répertoire récursivement
   */
  private async scanDirectory(
    dir: string,
    type: "api" | "pages"
  ): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Ignorer les dossiers privés (commençant par _)
          if (!entry.name.startsWith("_")) {
            await this.scanDirectory(fullPath, type);
          }
        } else if (entry.isFile()) {
          await this.processFile(fullPath, type);
        }
      }
    } catch (error) {
      // Répertoire n'existe pas, ignorer silencieusement
      if ((error as any).code !== "ENOENT") {
        throw error;
      }
    }
  }

  /**
   * 📄 Traiter un fichier individuel
   */
  private async processFile(
    filePath: string,
    type: "api" | "pages"
  ): Promise<void> {
    const ext = this.getFileExtension(filePath);
    if (!this.options.extensions.includes(ext)) return;

    const fileName = this.getFileName(filePath);
    const relativePath = this.getRelativePath(filePath, type);

    // Traiter selon le type de fichier
    switch (fileName) {
      case "route":
        await this.processApiRoute(filePath, relativePath);
        break;
      case "page":
        await this.processPageRoute(filePath, relativePath);
        break;
      case "layout":
        await this.processLayout(filePath, relativePath);
        break;
      case "_middleware":
      case "middleware":
        await this.processMiddleware(filePath, relativePath);
        break;
      default:
        // Ignorer les autres fichiers
        break;
    }

    // Ajouter à la liste des fichiers surveillés
    if (this.options.enableHotReload) {
      this.watchedFiles.add(filePath);
    }
  }

  /**
   * 🛣️ Traiter une route API
   */
  private async processApiRoute(
    filePath: string,
    relativePath: string
  ): Promise<void> {
    try {
      const module = await import(filePath);
      const routePath = this.convertFilePathToRoute(relativePath);

      // Supporter les méthodes HTTP standard
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        if (module[method]) {
          const routeInfo: RouteInfo = {
            path: routePath,
            filePath,
            method,
            handler: module[method],
            middleware: this.getMiddlewareForPath(routePath),
            params: this.extractParams(routePath),
            isDynamic: this.isDynamicRoute(routePath),
            priority: this.calculatePriority(routePath),
          };

          const key = `${method}:${routePath}`;
          this.routes.set(key, routeInfo);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing API route ${filePath}:`, error);
    }
  }

  /**
   * 📄 Traiter une route de page
   */
  private async processPageRoute(
    filePath: string,
    relativePath: string
  ): Promise<void> {
    try {
      const module = await import(filePath);
      const routePath = this.convertFilePathToRoute(relativePath);

      if (module.default) {
        const routeInfo: RouteInfo = {
          path: routePath,
          filePath,
          method: "GET",
          handler: this.createPageHandler(module.default, routePath),
          middleware: this.getMiddlewareForPath(routePath),
          params: this.extractParams(routePath),
          isDynamic: this.isDynamicRoute(routePath),
          priority: this.calculatePriority(routePath),
        };

        const key = `GET:${routePath}`;
        this.routes.set(key, routeInfo);
      }
    } catch (error) {
      console.error(`❌ Error processing page route ${filePath}:`, error);
    }
  }

  /**
   * 🎨 Traiter un layout
   */
  private async processLayout(
    filePath: string,
    relativePath: string
  ): Promise<void> {
    try {
      const module = await import(filePath);
      const layoutPath = this.convertFilePathToRoute(relativePath);

      if (module.default) {
        const layoutInfo: LayoutInfo = {
          path: layoutPath,
          filePath,
          component: module.default,
        };

        this.layouts.set(layoutPath, layoutInfo);
      }
    } catch (error) {
      console.error(`❌ Error processing layout ${filePath}:`, error);
    }
  }

  /**
   * 🛡️ Traiter un middleware
   */
  private async processMiddleware(
    filePath: string,
    relativePath: string
  ): Promise<void> {
    try {
      const module = await import(filePath);
      const middlewarePath = this.convertFilePathToRoute(relativePath);

      if (module.default) {
        const existingMiddleware = this.middleware.get(middlewarePath) || [];
        existingMiddleware.push(module.default);
        this.middleware.set(middlewarePath, existingMiddleware);
      }
    } catch (error) {
      console.error(`❌ Error processing middleware ${filePath}:`, error);
    }
  }

  /**
   * 📝 Enregistrer les routes dans Hono
   */
  private registerRoutes(routes: RouteInfo[]): void {
    for (const route of routes) {
      const { method, path, handler, middleware = [] } = route;

      // Appliquer les middlewares
      if (middleware.length > 0) {
        this.app.use(path, ...middleware);
      }

      // Enregistrer la route
      switch (method.toUpperCase()) {
        case "GET":
          this.app.get(path, handler);
          if (this.options.verbose) {
            console.log(
              `🔗 Registered GET route: ${path} ${
                route.isDynamic ? "(dynamic)" : "(static)"
              }`
            );
          }
          break;
        case "POST":
          this.app.post(path, handler);
          if (this.options.verbose) {
            console.log(
              `🔗 Registered POST route: ${path} ${
                route.isDynamic ? "(dynamic)" : "(static)"
              }`
            );
          }
          break;
        case "PUT":
          this.app.put(path, handler);
          if (this.options.verbose) {
            console.log(
              `🔗 Registered PUT route: ${path} ${
                route.isDynamic ? "(dynamic)" : "(static)"
              }`
            );
          }
          break;
        case "DELETE":
          this.app.delete(path, handler);
          if (this.options.verbose) {
            console.log(
              `🔗 Registered DELETE route: ${path} ${
                route.isDynamic ? "(dynamic)" : "(static)"
              }`
            );
          }
          break;
        case "PATCH":
          this.app.patch(path, handler);
          if (this.options.verbose) {
            console.log(
              `🔗 Registered PATCH route: ${path} ${
                route.isDynamic ? "(dynamic)" : "(static)"
              }`
            );
          }
          break;
      }
    }
  }

  /**
   * 🎭 Créer un handler pour une page
   */
  private createPageHandler(PageComponent: any, routePath: string) {
    return async (c: Context) => {
      try {
        // Récupérer les paramètres de route
        const params = c.req.param();

        // Rendre la page avec SSR
        const { renderToString } = await import("react-dom/server");
        const { createElement } = await import("react");

        const pageElement = createElement(PageComponent, { params });
        const content = renderToString(pageElement);

        // Utiliser le template HTML optimisé depuis route-utils
        const { generateHTMLTemplate } = await import("./route-utils");
        const html = await generateHTMLTemplate(
          content,
          `BHR App - ${routePath}`,
          routePath
        );

        return c.html(html);
      } catch (error) {
        console.error(`❌ Error rendering page ${routePath}:`, error);
        return c.text("Internal Server Error", 500);
      }
    };
  }

  // 🔧 Méthodes utilitaires
  private getFileExtension(filePath: string): string {
    return filePath.substring(filePath.lastIndexOf("."));
  }

  private getFileName(filePath: string): string {
    const baseName = filePath.substring(filePath.lastIndexOf(sep) + 1);
    return baseName.substring(0, baseName.lastIndexOf("."));
  }

  private getRelativePath(filePath: string, type: "api" | "pages"): string {
    const baseDir =
      type === "api" ? this.options.apiDir : this.options.pagesDir;
    return relative(baseDir, filePath);
  }

  private convertFilePathToRoute(relativePath: string): string {
    let route = relativePath
      .replace(/\\/g, "/") // Windows compatibility
      .replace(/\.(ts|tsx|js|jsx)$/, "") // Remove extension
      .replace(/\/page$/, "") // Remove page suffix
      .replace(/\/route$/, "") // Remove route suffix
      .replace(/\/index$/, "") // Remove index suffix
      .replace(/\[([^\]]+)\]/g, ":$1") // Convert [param] to :param
      .replace(/\[\.\.\.([^\]]+)\]/g, "*$1"); // Convert [...slug] to *slug

    // Handle route groups (group) - remove from URL
    route = route.replace(/\/\([^)]+\)/g, "");

    // Handle special case: root page.tsx should become /
    if (route === "page" || route === "/page") {
      return "/";
    }

    // Ensure route starts with /
    if (!route.startsWith("/")) {
      route = "/" + route;
    }

    // Handle root route
    if (route === "/") {
      return "/";
    }

    // Remove trailing slash
    return route.replace(/\/$/, "");
  }

  private extractParams(routePath: string): string[] {
    const params: string[] = [];
    const matches = routePath.matchAll(/:([^\/]+)/g);
    for (const match of matches) {
      params.push(match[1]);
    }
    return params;
  }

  private isDynamicRoute(routePath: string): boolean {
    return routePath.includes(":") || routePath.includes("*");
  }

  private calculatePriority(routePath: string): number {
    // Plus spécifique = priorité plus haute
    let priority = 1000;

    // Réduire la priorité pour les routes dynamiques
    const dynamicSegments = (routePath.match(/[:*]/g) || []).length;
    priority -= dynamicSegments * 100;

    // Augmenter la priorité pour les routes plus longues
    const segments = routePath.split("/").length;
    priority += segments * 10;

    return priority;
  }

  private getMiddlewareForPath(routePath: string): any[] {
    const middleware: any[] = [];

    // Chercher les middlewares qui s'appliquent à ce chemin
    for (const [middlewarePath, middlewareList] of this.middleware.entries()) {
      if (routePath.startsWith(middlewarePath)) {
        middleware.push(...middlewareList);
      }
    }

    return middleware;
  }

  private logRoutes(): void {
    console.log("\n📋 Registered Routes:");
    const sortedRoutes = Array.from(this.routes.values()).sort((a, b) =>
      a.path.localeCompare(b.path)
    );

    for (const route of sortedRoutes) {
      const dynamicFlag = route.isDynamic ? "🔄" : "📄";
      const middlewareFlag =
        route.middleware && route.middleware.length > 0 ? "🛡️" : "";
      console.log(
        `  ${dynamicFlag} ${route.method.padEnd(6)} ${
          route.path
        } ${middlewareFlag}`
      );
    }
    console.log("");
  }
}

// 🚀 Export de la fonction principale
export async function createFileRouter(
  app: Hono,
  options?: Partial<FileRouterOptions>
): Promise<BHRFileRouter> {
  const router = new BHRFileRouter(app, options);
  await router.scan();
  return router;
}
