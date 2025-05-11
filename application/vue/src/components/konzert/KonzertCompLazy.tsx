import { lazy, Suspense } from "react";
import { Spin } from "antd";

const KonzertComp = lazy(() => import("./KonzertComp.tsx"));

export default function KonzertCompLazy() {
  return (
    <Suspense fallback={<Spin fullscreen spinning />}>
      <h2>Preview</h2>
      <KonzertComp />;
    </Suspense>
  );
}
