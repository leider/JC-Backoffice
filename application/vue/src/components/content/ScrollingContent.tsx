import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useGlobalContext } from "@/app/GlobalContext.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

export default function ScrollingContent({ children }: PropsWithChildren) {
  const { isCompactMode, viewport } = useGlobalContext();
  const { xs } = useBreakpoint();
  const ref = useRef<HTMLDivElement | null>(null);
  const [contentTop, setContentTop] = useState<number>(0);

  useEffect(() => {
    if (ref?.current?.getBoundingClientRect().top) {
      setContentTop(ref.current?.getBoundingClientRect().top);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompactMode, ref?.current?.getBoundingClientRect().top]);

  const contentHeight = useMemo(() => viewport.height - 10 - contentTop, [viewport, contentTop]);

  return xs ? (
    children
  ) : (
    <div ref={ref} style={{ maxHeight: contentHeight, overflowX: "clip", overflowY: "auto" }}>
      {children}
    </div>
  );
}
