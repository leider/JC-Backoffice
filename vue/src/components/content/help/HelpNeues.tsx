import * as React from "react";
import HelpSection from "@/components/content/help/HelpSection.tsx";

export default function HelpNeues() {
  const items = [
    {
      title: "Filter in Veranstaltungsübersicht",
      description: "April '24",
      content: "In der Übersicht der Veranstaltungen kann jetzt gefiltert werden.",
    },
  ];

  return <HelpSection label={<b>Neues</b>} items={items} />;
}
