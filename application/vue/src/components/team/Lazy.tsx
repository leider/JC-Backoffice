import React, { JSX, Suspense, useCallback } from "react";

export default function Lazy({
  component: Component,
  loadingComponent: LoadingComp,
}: {
  readonly component: JSX.Element;
  readonly loadingComponent: JSX.Element;
}) {
  const Inner = useCallback(() => Component, [Component]);
  const Result = React.lazy(() => Promise.resolve({ default: Inner }));
  return (
    <Suspense fallback={LoadingComp}>
      <Result />
    </Suspense>
  );
}
