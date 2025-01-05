import { Calendar, ComplexDate, Parser } from "ikalendar";
import { TerminEvent } from "../optionen/termin.js";

export function parseIcal(text: string) {
  // workaround for cals having a field named TEXT like https://www.ferienwiki.de/exports/ferien/2020/de/baden-wuerttemberg
  const workaround = text.replace("NAME:", "COMMENT:");
  return new Parser().parse(workaround);
}

export function icalToTerminEvents(ical: Calendar) {
  function toIsoString(event?: string | ComplexDate): string {
    if (!event) {
      return "";
    }
    if (typeof event === "string") {
      return event;
    }
    return toIsoString((event as ComplexDate).value);
  }

  return (ical.events ?? []).map((event) => ({
    backgroundColor: ical.color,
    borderColor: ical.color,
    display: "block",
    start: toIsoString(event.start),
    end: toIsoString(event.end || event.start),
    title: event.summary || "",
    tooltip: event.summary || "",
  })) as TerminEvent[];
}
