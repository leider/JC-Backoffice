import * as React from "react";
import HelpSection from "@/components/content/help/HelpSection.tsx";

export default function HelpNeues() {
  const items = [
    {
      title: "Gästeliste aus Preview editierbar",
      description: "Juli '24",
      content: 'Jeder Anwender mit Recht "Kasse" darf auch die Gästeliste bearbeiten.',
    },
    {
      title: "Belege entfernt",
      description: "Juli '24",
      content: "Die Funktionalität wurde entfernt.",
    },
    {
      title: "Verbesserungen in Kalkulation",
      description: "Mai '24",
      content:
        "Darstellung Konzert-Kalkulation ist verbessert. KSK, GEMA Berechnung, Klavierstimmer mit 125,- vorbelegt. Technik Ausgaben und Saalmiete nicht mehr editierbar.",
    },
    {
      title: "Filter in Veranstaltungsübersicht",
      description: "April '24",
      content: "In der Übersicht der Veranstaltungen kann jetzt gefiltert werden.",
    },
  ];

  return <HelpSection initiallyOpen={true} label={<b>Neues</b>} items={items} />;
}
