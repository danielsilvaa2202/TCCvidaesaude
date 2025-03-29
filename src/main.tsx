import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { AxiosError } from "axios";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { handleServerError } from "@/utils/handle-server-error";
import { toast } from "@/hooks/use-toast";
import { ThemeProvider } from "@/context/theme-context";
import "./index.css";

import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) {
          console.log("[React Query Retry]", { failureCount, error });
        }
        if (failureCount > 3) return false;
        return true;
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000,
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast({
            variant: "destructive",
            title: "Sessão expirada!",
          });
          useAuthStore.getState().reset();
          const redirect = router.history.location.href;
          router.navigate({ to: "/sign-in-2", search: { redirect } });
        }
        if (error.response?.status === 500) {
          toast({
            variant: "destructive",
            title: "Erro interno do servidor!",
          });
          router.navigate({ to: "/500" });
        }
      }
    },
  }),
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
