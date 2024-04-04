import * as React from "react";
import { useLocation } from "react-router-dom";
import HelpSection from "@/components/content/help/HelpSection.tsx";

export default function HelpVeranstaltungen() {
  const { pathname } = useLocation();

  const veranstaltungenAktionen = [
    {
      title: "Neu",
      content: "Hiermit legst Du ein neues Konzert / eine neue Vermietung an.",
    },
    {
      title: "Zukünftige",
      content: 'Hier wählst Du aus, welche Veranstaltungen Dir angezeigt werden. Alternativ: "Vergangene" und "Alle".',
    },
    {
      title: "Kalender...",
      content:
        'Öffnet eine Kalenderansicht der Veranstaltungen. Darin findest Du noch die Möglichkeit, eine große Ansicht für Kalender zu öffnen sowie eine "ical"-Datei zu abbonieren, den Du in Deinen lokalen Kalender importieren kannst.',
    },

    {
      title: "Kalkulation (Exel)",
      content:
        "Hiermit kannst Du Excel-Dateien generieren, um für ausgewählte Veranstaltungen eine Einnahmen  Ausgaben Übersicht zu erhalten.",
    },
  ];

  const veranstaltungen = [
    {
      title: "Was sind die Aktionen in der Monatszeile?",
      content:
        'Mit "Pressetexte" oder "Übersicht" kommst Du auf eine eigene Seite mit einer kompakten Darstellung der Pressetexte und Bilder aller Veranstaltungen des Monats.',
    },
    {
      title: "Was sehe ich?",
      content: "Vergangene, zukünftige oder alle Veranstaltungen. Der aktuelle und der nächste Monat sind detaillierter.",
    },
    {
      title: "Einzelne Veranstaltung",
      content: "Je Veranstaltung siehst Du noch kleine Marker, die Dir Auskunft über Eigenschaften geben.",
    },
    {
      title: "Das Männchen links unten?",
      content: "Das Männchen kannst Du aufklappen, um Mitarbeiter zu bearbeiten. Danach das Speichern nicht vergessen.",
    },

    {
      title: "Und die Icons?",
      content: "Mit den Icons kannst Du direkt in eine Bearbeitungsseite springen, oder - beim Auge - auf die kompakte Übersicht.",
    },
  ];

  return (
    pathname === "/veranstaltungen" && (
      <>
        <HelpSection
          label={
            <span>
              <b>Veranstaltungen - Aktionen</b> Hier siehst Du alles in einer Übersicht. In der Titelzeile findest Du Knöpfe für Aktionen:
            </span>
          }
          items={veranstaltungenAktionen}
        />
        <HelpSection
          label={
            <span>
              <b>Veranstaltungen:</b>
            </span>
          }
          items={veranstaltungen}
        />
      </>
    )
  );
}
