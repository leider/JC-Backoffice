import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./router/index-react";

const router = createBrowserRouter(routes, { basename: "/vue/nested" });

const STRICT = false;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  STRICT ? (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  ) : (
    <RouterProvider router={router} />
  )
);
