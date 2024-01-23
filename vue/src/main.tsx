import React from "react";
import ReactDOM from "react-dom/client";
import { JazzRouter } from "./router/JazzRouter.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <JazzRouter />
  </React.StrictMode>,
);
