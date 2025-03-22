import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/toaster";

import GeneralError from "@/features/errors/general-error";
import NotFoundError from "@/features/errors/not-found-error";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => {
    return (
      <>
        <Outlet />
        <Toaster />

        {/* Se você quer “bottom-left” mas está dando erro de tipo, faça: */}
        {import.meta.env.MODE === "development" && (
          <>
            <ReactQueryDevtools
              // Se sua versão aceita, use diretamente:
              // position="bottom-left"
              // Se não aceita mas funciona em runtime, use casting:
              position={"bottom-left" as any}
              initialIsOpen={false}
            />
            <TanStackRouterDevtools position="bottom-right" />
          </>
        )}
      </>
    );
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
});
