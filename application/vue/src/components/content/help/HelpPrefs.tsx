import * as React from "react";
import HelpSection from "@/components/content/help/HelpSection.tsx";

export default function HelpPrefs() {
  const wiki = [
    {
      title: "Anzeige Einstellungen",
      content:
        "Hier kannst Du Hell/Dunkel sowie die Darstellungsgröße ändern, falls Du mit den automatischen Vorgaben nicht zufrieden bist.",
      description: "Unter dem Benutzermenü rechts kannst Du festlegen, wie die Darstellung sein soll.",
    },
  ];

  return (
    <HelpSection
      initiallyOpen
      items={wiki}
      label={
        <span>
          <b>Einstellungen</b>
        </span>
      }
    />
  );
}
