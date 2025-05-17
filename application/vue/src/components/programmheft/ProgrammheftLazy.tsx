import { lazy, Suspense } from "react";
import { Spin } from "antd";

const Programmheft = lazy(() => import("./Programmheft.tsx"));

export default function ProgrammheftLazy() {
  return (
    <Suspense fallback={<Spin fullscreen spinning />}>
      <Programmheft />;
    </Suspense>
  );
}
