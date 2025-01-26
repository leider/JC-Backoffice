import "./calendar.css";
import { PropsWithChildren } from "react";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function WrapFullCalendar({ children }: PropsWithChildren) {
  const { isDarkMode } = useJazzContext();
  return <div className={isDarkMode ? "dark-calendar" : "bright-calendar"}>{children}</div>;
}
