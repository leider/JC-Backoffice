import { lazy, Suspense } from "react";
import { Spin } from "antd";

const VermietungComp = lazy(() => import("./VermietungComp.tsx"));

export default function VermietungCompLazy() {
  return (
    <Suspense fallback={<Spin fullscreen spinning />}>
      <VermietungComp />;
    </Suspense>
  );
}
