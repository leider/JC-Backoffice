import React from "react";
import ReactDOM from "react-dom/client";
import { JazzRouter } from "./router/JazzRouter.tsx";

window.addEventListener("error", (e: ErrorEvent) => {
  // eslint-disable-next-line no-console
  console.error(e);
});

window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
  // eslint-disable-next-line no-console
  console.error(e);
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <JazzRouter />
  </React.StrictMode>,
);
