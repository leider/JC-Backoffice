import { useState, useEffect } from "react";

export default function useIsTouchScreen() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    function detectTouch() {
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches);
    }
    detectTouch();
    window.addEventListener("resize", detectTouch);
    return () => window.removeEventListener("resize", detectTouch);
  }, []);

  return isTouch;
}
