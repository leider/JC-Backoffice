import * as React from "react";
import { useLocation } from "react-router";
import HelpSection from "@/components/content/help/HelpSection.tsx";

export default function HelpKonzert() {
  const { pathname } = useLocation();

  const konzertAktionen = [
    {
      title: "Mehr...",
      content: "Kopieren, Löschen (wenn unbestätigt), Exporte (Kalkulation, Pressefotos, Kassenzettel) und Änderungshistorie",
    },
    {
      title: "Speichern",
      content: "Wenn geändert, kannst Du speichern",
    },
    {
      title: "Kalender...",
      content:
        'Öffnet eine Kalenderansicht der Veranstaltungen. Darin findest Du noch die Möglichkeit, eine große Ansicht für Kalender zu öffnen sowie eine "ical"-Datei zu abonnieren, den Du in Deinen lokalen Kalender importieren kannst.',
    },
  ];

  const konzert = [
    {
      title: "Was sehe ich?",
      content: "Diverse Tabs, um die Eigenschaften eines Konzerts zu bearbeiten.",
    },
  ];

  return (
    pathname.startsWith("/konzert") && (
      <>
        <HelpSection
          initiallyOpen
          items={konzertAktionen}
          label={
            <span>
              <b>Konzert - Aktionen</b> Hier siehst Du alles in einer Übersicht. In der Titelzeile findest Du Knöpfe für Aktionen:
            </span>
          }
        />
        <HelpSection
          items={konzert}
          label={
            <span>
              <b>Konzert:</b>
            </span>
          }
        />
      </>
    )
  );
}
