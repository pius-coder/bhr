import { hydrateRoot, createRoot } from "react-dom/client";
import { createElement } from "react";

// Import direct des pages pour éviter les problèmes d'hydratation
import HomePage from "../app/(pages)/page";
import AboutPage from "../app/(pages)/about/page";

// 📊 Interface pour les métriques de performance
interface BHRPerformance {
  navigationStart: number;
  buildId: string;
  route: string;
  framework: string;
  ssrRender?: number;
  hydrationStart?: number;
  hydrationEnd?: number;
  firstInteraction?: number;
}

declare global {
  interface Window {
    __BHR_PERFORMANCE__: BHRPerformance;
    gtag?: (...args: any[]) => void;
  }
}

// 🎯 Router côté client avec métriques
const getPageComponent = () => {
  const path = window.location.pathname;

  // Marquer la résolution de route
  performance.mark("bhr-route-resolve-start");

  let component;
  switch (path) {
    case "/":
      component = HomePage;
      break;
    case "/about":
      component = AboutPage;
      break;
    default:
      console.warn(`Route non trouvée: ${path}, fallback vers HomePage`);
      component = HomePage;
  }

  performance.mark("bhr-route-resolve-end");
  performance.measure(
    "BHR-Route-Resolve",
    "bhr-route-resolve-start",
    "bhr-route-resolve-end"
  );

  return component;
};

// 📊 Fonction de reporting des métriques BHR
function reportBHRMetric(name: string, value: number, unit: string = "ms") {
  console.log(`🎯 ${name}: ${value.toFixed(2)}${unit}`);

  // Stocker dans l'objet global de performance
  if (window.__BHR_PERFORMANCE__) {
    (window.__BHR_PERFORMANCE__ as any)[name.toLowerCase().replace("-", "")] =
      value;
  }

  // Envoyer à un service d'analytics en production
  if (
    process.env.NODE_ENV === "production" &&
    typeof window.gtag !== "undefined"
  ) {
    window.gtag("event", name, {
      value: Math.round(value),
      custom_parameter: window.__BHR_PERFORMANCE__?.buildId,
    });
  }
}

// 🚀 Hydratation optimisée avec métriques détaillées
function hydrateApp() {
  const hydrationStart = performance.now();
  performance.mark("bhr-hydration-start");

  // Stocker le début d'hydratation
  if (window.__BHR_PERFORMANCE__) {
    window.__BHR_PERFORMANCE__.hydrationStart = hydrationStart;
  }

  try {
    const PageComponent = getPageComponent();
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      throw new Error("Element root non trouvé pour l'hydratation");
    }

    // Vérifier les attributs de données pour l'hydratation
    const isServerRendered = rootElement.dataset.serverRendered === "true";

    if (!rootElement.innerHTML.trim() || !isServerRendered) {
      console.warn("🔄 Rendu côté client au lieu d'hydratation");
      performance.mark("bhr-client-render-start");

      const root = createRoot(rootElement);
      root.render(createElement(PageComponent));

      performance.mark("bhr-client-render-end");
      performance.measure(
        "BHR-Client-Render",
        "bhr-client-render-start",
        "bhr-client-render-end"
      );

      const clientRenderMeasure =
        performance.getEntriesByName("BHR-Client-Render")[0];
      if (clientRenderMeasure) {
        reportBHRMetric("BHR-Client-Render", clientRenderMeasure.duration);
      }
    } else {
      console.log("🎉 Hydratation SSR → Client");

      // Hydratation avec gestion d'erreurs
      hydrateRoot(rootElement, createElement(PageComponent), {
        onRecoverableError: (error) => {
          console.warn("⚠️ Erreur récupérable lors de l'hydratation:", error);
        },
      });

      performance.mark("bhr-hydration-end");
      performance.measure(
        "BHR-Hydration",
        "bhr-hydration-start",
        "bhr-hydration-end"
      );

      const hydrationMeasure = performance.getEntriesByName("BHR-Hydration")[0];
      if (hydrationMeasure) {
        reportBHRMetric("BHR-Hydration", hydrationMeasure.duration);

        // Stocker la fin d'hydratation
        if (window.__BHR_PERFORMANCE__) {
          window.__BHR_PERFORMANCE__.hydrationEnd = performance.now();
        }
      }
    }

    // Marquer l'application comme prête
    performance.mark("bhr-app-ready");
    const totalTime =
      performance.now() - (window.__BHR_PERFORMANCE__?.navigationStart || 0);
    reportBHRMetric("BHR-Total-Load", totalTime);

    // Écouter la première interaction utilisateur
    setupInteractionTracking();
  } catch (error) {
    console.error("❌ Erreur critique lors de l'hydratation:", error);

    // Fallback : essayer un rendu client simple
    try {
      const PageComponent = getPageComponent();
      const rootElement = document.getElementById("root");
      if (rootElement) {
        const root = createRoot(rootElement);
        root.render(createElement(PageComponent));
        console.log("🔄 Fallback vers rendu client réussi");
      }
    } catch (fallbackError) {
      console.error("💥 Échec du fallback:", fallbackError);
    }
  }
}

// 🎮 Tracking des interactions utilisateur
function setupInteractionTracking() {
  const trackFirstInteraction = (_event: Event) => {
    if (!window.__BHR_PERFORMANCE__?.firstInteraction) {
      const interactionTime = performance.now();
      window.__BHR_PERFORMANCE__.firstInteraction = interactionTime;

      const timeToInteractive =
        interactionTime - (window.__BHR_PERFORMANCE__.navigationStart || 0);
      reportBHRMetric("BHR-Time-To-Interactive", timeToInteractive);

      // Nettoyer les listeners après la première interaction
      ["click", "keydown", "touchstart"].forEach((eventType) => {
        document.removeEventListener(eventType, trackFirstInteraction, {
          capture: true,
        });
      });
    }
  };

  // Écouter les premiers événements d'interaction
  ["click", "keydown", "touchstart"].forEach((eventType) => {
    document.addEventListener(eventType, trackFirstInteraction, {
      capture: true,
      once: true,
    });
  });
}

// 🚀 Point d'entrée principal
function initBHRApp() {
  // Vérifier si les APIs nécessaires sont disponibles
  if (typeof hydrateRoot === "undefined") {
    console.error("❌ React 18+ requis pour l'hydratation");
    return;
  }

  // Initialiser les métriques si pas déjà fait
  if (!window.__BHR_PERFORMANCE__) {
    window.__BHR_PERFORMANCE__ = {
      navigationStart: performance.now(),
      buildId: `bhr-${Date.now()}`,
      route: window.location.pathname,
      framework: "BHR",
    };
  }

  hydrateApp();
}

// Attendre que le DOM soit prêt avec gestion d'erreurs
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBHRApp);
} else {
  // DOM déjà prêt, démarrer immédiatement
  initBHRApp();
}
