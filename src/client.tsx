import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

const fallback = document.documentElement.dataset.spaFallback === "true";

startTransition(() => {
  const app = (
    <StrictMode>
      <StartClient />
    </StrictMode>
  );
  // The shared 404 shell was rendered at /, so its navigation and body cannot
  // match an arbitrary missing URL. Render that document on the client instead
  // of hydrating mismatched HTML. Published pages keep normal SSR hydration.
  if (fallback) createRoot(document).render(app);
  else hydrateRoot(document, app);
});
