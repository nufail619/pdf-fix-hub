import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const context = { queryClient, isSpaShell: (): boolean => false };

  const router = createRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
  // Start sets the request's shell flag after creating the router. Read it
  // lazily so the fallback's HTML and dehydrated metadata agree.
  context.isSpaShell = () => router.isShell();

  return router;
};
