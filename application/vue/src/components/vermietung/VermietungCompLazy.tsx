import { lazy, Suspense } from "react";
import { Spin } from "antd";

const VermietungComp = lazy(() => import("./VermietungComp.tsx"));

export default function VermietungCompLazy() {
  return (
    <Suspense fallback={<Spin fullscreen spinning />}>
      <h2>Preview</h2>
      <VermietungComp />;
    </Suspense>
  );
}
