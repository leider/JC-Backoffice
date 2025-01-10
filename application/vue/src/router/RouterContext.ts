import { createContext } from "react";
import { RouteState } from "@/router/useCreateRouteState.tsx";
import noop from "lodash/fp/noop";

export const RouterContext = createContext<RouteState>({ routes: [], setCurrentUser: noop });
