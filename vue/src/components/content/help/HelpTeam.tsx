import * as React from "react";
import { useLocation } from "react-router-dom";
import HelpSection from "@/components/content/help/HelpSection.tsx";
import { theme } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";

export default function HelpTeam() {
  const { pathname } = useLocation();
  const { token } = theme.useToken();

  const teamAktionen = [
    {
      title: "Zukünftige",
      content: 'Hier wählst Du aus, welche Veranstaltungen Dir angezeigt werden. Alternativ: "Vergangene".',
    },
    {
      title: "Kalender...",
      content:
        'Öffnet eine Kalenderansicht der Veranstaltungen. Darin findest Du noch die Möglichkeit, eine große Ansicht für Kalender zu öffnen sowie eine "ical"-Datei zu abonnieren, den Du in Deinen lokalen Kalender importieren kannst.',
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
          Was sind die Aktionen in der Monatszeile? <ButtonWithIcon text="Pressetexte" size="small" type="default" icon="FileText" />
          <ButtonWithIcon text="Übersicht" size="small" type="default" icon="FileSpreadsheet" />
        </span>
      ),
      content:
        'Mit "Pressetexte" oder "Übersicht" kommst Du auf eine eigene Seite mit einer kompakten Darstellung der Pressetexte und Bilder aller Veranstaltungen des Monats.',
    },
    {
      title: "Was sehe ich?",
      content: "Vergangene oder zukünftige Veranstaltungen. Der aktuelle und der nächste Monat sind detaillierter.",
    },
    {
      title: (
        <span>
          Und das Auge? <ButtonWithIcon color={token.colorSuccess} size="small" icon="EyeFill" />
        </span>
      ),
      content: "Mit dem Auge kannst Du direkt auf die kompakte Übersicht springen.",
    },
  ];

  return (
    pathname === "/team" && (
      <>
        <HelpSection
          initiallyOpen={true}
          label={
            <span>
              <b>Veranstaltungen - Aktionen</b> Hier siehst Du alles in einer Übersicht. In der Titelzeile findest Du Knöpfe für Aktionen:
            </span>
          }
          items={teamAktionen}
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
