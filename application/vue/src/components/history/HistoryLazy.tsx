import { lazy, Suspense } from "react";
import { Spin } from "antd";

const History = lazy(() => import("./History.tsx"));

export default function HistoryLazy() {
  return (
    <Suspense fallback={<Spin fullscreen spinning />}>
      <History />;
    </Suspense>
  );
}
