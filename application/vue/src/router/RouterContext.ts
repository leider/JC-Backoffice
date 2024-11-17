import { createContext } from "react";
import { RouteState } from "@/router/useCreateRouteState.tsx";

export const RouterContext = createContext<RouteState>({ routes: [], setCurrentUser: () => {} });
