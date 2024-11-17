import { createBrowserRouter, RouterProvider } from "react-router-dom";
import * as React from "react";
import { useContext, useMemo } from "react";
import { useCreateRouteState } from "@/router/useCreateRouteState.tsx";
import { RouterContext } from "@/router/RouterContext.ts";

function RouterWrapper() {
  const { routes } = useContext(RouterContext);

  const router = useMemo(() => {
    return createBrowserRouter(routes, { basename: "/vue" });
  }, [routes]);
  return <RouterProvider router={router} />;
}

export function JazzRouter() {
  const loginState = useCreateRouteState();
  return (
    <RouterContext.Provider value={loginState}>
      <RouterWrapper />
    </RouterContext.Provider>
  );
}
