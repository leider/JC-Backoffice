import * as React from "react";
import { useLocation } from "react-router";
import HelpSection from "@/components/content/help/HelpSection.tsx";
import { Tag, theme } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";

export default function HelpVeranstaltungen() {
  const { pathname } = useLocation();
  const { color, icon } = colorsAndIconsForSections;
  const { token } = theme.useToken();

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
        'Öffnet eine Kalenderansicht der Veranstaltungen. Darin findest Du noch die Möglichkeit, eine große Ansicht für Kalender zu öffnen sowie eine "ical"-Datei zu abonnieren, den Du in Deinen lokalen Kalender importieren kannst.',
    },
    {
      title: "Kalkulation (Exel)",
      content:
        "Hiermit kannst Du Excel-Dateien generieren, um für ausgewählte Veranstaltungen eine Einnahmen  Ausgaben Übersicht zu erhalten.",
    },
    {
      title: "Filter",
      content:
        'Hier kannst Du die angezeigten Veranstaltungen durch setzen von Filtern auswählen. Die Filter gelten dann auch für die Anzeige in "Pressetexte" und "Übersicht". ',
    },
  ];

  const veranstaltungen = [
    {
      title: (
        <span>
          Was sind die Aktionen in der Monatszeile? <ButtonWithIcon icon="FileText" size="small" text="Pressetexte" type="default" />
          <ButtonWithIcon icon="FileSpreadsheet" size="small" text="Übersicht" type="default" />
        </span>
      ),
      content:
        'Mit "Pressetexte" oder "Übersicht" kommst Du auf eine eigene Seite mit einer kompakten Darstellung der Pressetexte und Bilder aller Veranstaltungen des Monats.',
    },
    {
      title: "Was sehe ich?",
      content: "Vergangene, zukünftige oder alle Veranstaltungen. Der aktuelle und der nächste Monat sind detaillierter.",
    },
    {
      title: (
        <span>
          Einzelne Veranstaltung <Tag color="success">Bestätigt</Tag>
        </span>
      ),
      content: "Je Veranstaltung siehst Du noch kleine Marker, die Dir Auskunft über Eigenschaften geben.",
    },
    {
      title: (
        <span>
          Das Männchen <IconForSmallBlock iconName="UniversalAccess" /> links unten?
        </span>
      ),
      content: "Das Männchen kannst Du aufklappen, um Mitarbeiter zu bearbeiten. Danach das Speichern nicht vergessen.",
    },

    {
      title: (
        <span>
          Und die Icons? <ButtonWithIcon color={color("allgemeines")} icon={icon("allgemeines")} size="small" />
          <ButtonWithIcon color={color("gaeste")} icon={icon("gaeste")} size="small" />
          <ButtonWithIcon color={color("technik")} icon={icon("technik")} size="small" />
          <ButtonWithIcon color={color("ausgaben")} icon={icon("ausgaben")} size="small" />
          <ButtonWithIcon color={color("hotel")} icon={icon("hotel")} size="small" />
          <ButtonWithIcon color={color("kasse")} icon={icon("kasse")} size="small" />
          <ButtonWithIcon color={token.colorSuccess} icon="EyeFill" size="small" />
        </span>
      ),
      content: "Mit den Icons kannst Du direkt in eine Bearbeitungsseite springen, oder - beim Auge - auf die kompakte Übersicht.",
    },
  ];

  return (
    pathname === "/veranstaltungen" && (
      <>
        <HelpSection
          initiallyOpen
          items={veranstaltungenAktionen}
          label={
            <span>
              <b>Veranstaltungen - Aktionen</b> Hier siehst Du alles in einer Übersicht. In der Titelzeile findest Du Knöpfe für Aktionen:
            </span>
          }
        />
        <HelpSection
          items={veranstaltungen}
          label={
            <span>
              <b>Veranstaltungen:</b>
            </span>
          }
        />
      </>
    )
  );
}
