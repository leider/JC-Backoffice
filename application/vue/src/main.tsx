import React from "react";
import ReactDOM from "react-dom/client";
import "@ant-design/v5-patch-for-react-19";
import isUndefined from "lodash/isUndefined";

(async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (isUndefined(Intl.Segmenter)) {
    await import("@formatjs/intl-segmenter/polyfill");
  }

  // Now it's safe to use Intl.Segmenter
  const { JazzRouter } = await import("./router/JazzRouter.tsx");
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <JazzRouter />
    </React.StrictMode>,
  );
})();
window.addEventListener("error", (e: ErrorEvent) => {
  // eslint-disable-next-line no-console
  console.error(e);
});

window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
  // eslint-disable-next-line no-console
  console.error(e);
});
