import { useMemo } from "react";

export default function useIsTouchScreen() {
  return useMemo(() => "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches, []);
}
