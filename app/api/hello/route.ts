import { Hono } from "hono";

const app = new Hono();

// 🎯 Middleware de performance pour les API routes
app.use("*", async (c, next) => {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;

  // Ajouter les headers de performance
  c.res.headers.set("X-Response-Time", `${duration}ms`);
  c.res.headers.set("X-Powered-By", "BHR-Framework");

  // Log des métriques (en développement)
  if (process.env.NODE_ENV !== "production") {
    console.log(`🎯 API ${c.req.method} ${c.req.path} - ${duration}ms`);
  }
});

// 🎯 Route GET /api/hello - Optimisée avec cache headers
app.get("/", (c) => {
  const data = {
    message: "Hello from BHR API! 🚀",
    success: true,
    timestamp: new Date().toISOString(),
    architecture: "Bun + Hono + React",
    version: "1.0.0",
    performance: {
      framework: "BHR",
      runtime: "Bun",
      ssr: true,
      hydration: "optimized",
    },
    features: [
      "Server-Side Rendering",
      "API Routes intégrées",
      "TypeScript natif",
      "Performance optimale",
      "Compression Gzip",
      "Métriques temps réel",
    ],
    benchmarks: {
      bundle_size: "0.25MB",
      hydration_time: "~50ms",
      ssr_render: "~15ms",
    },
  };

  // Cache headers pour optimiser les performances
  c.res.headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
  c.res.headers.set("ETag", `"bhr-${Date.now()}"`);

  return c.json(data, { status: 200 });
});

// 🎯 Route POST /api/hello - Avec validation et métriques
app.post("/", async (c) => {
  try {
    const body = await c.req.json();

    // Validation simple
    if (!body || typeof body !== "object") {
      return c.json(
        {
          error: "Invalid JSON body",
          success: false,
        },
        { status: 400 }
      );
    }

    const response = {
      message: `Hello ${body.name || "Anonymous"}! 👋`,
      received: body,
      success: true,
      processed_at: new Date().toISOString(),
      server_info: {
        framework: "BHR",
        runtime: "Bun",
        node_env: process.env.NODE_ENV || "development",
      },
    };

    return c.json(response, { status: 200 });
  } catch (error) {
    return c.json(
      {
        error: "Failed to process request",
        success: false,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

// 🎯 Route GET /api/hello/health - Health check optimisé
app.get("/health", (c) => {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0",
    framework: "BHR",
  };

  c.res.headers.set("Cache-Control", "no-cache");
  return c.json(healthData, { status: 200 });
});

export default app;
