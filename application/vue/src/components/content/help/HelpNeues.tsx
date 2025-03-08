import * as React from "react";
import HelpSection from "@/components/content/help/HelpSection.tsx";

export default function HelpNeues() {
  const brandNew = [
    {
      title: "Neuer Wysiwyg Editor",
      description: "Januar '25",
      content: "Im Wiki kann er auch Bilder, der alte war Mist. Zusätzlich kleine Verbesserungen speziell für mobile Geräte.",
    },
    {
      title: "Dark Mode and more",
      description: "Januar '25",
      content: "Für junge Kollegen... Außerdem kleine Detailverbesserungen.",
    },
    {
      title: "Erheblich verbesserte UI für Programmheft.",
      description: "November '24",
      content: "Die Tabelle wird jetzt viel besser dargestellt. Du kannst ein Programmheft aus einem anderen Monat kopieren.",
    },
    {
      title: "Echtes Wysiwyg in Texteditoren",
      description: "November '24",
      content: "Die formatierbaren Textfelder sind jetzt wysiwyg. Du brauchst keine Vorschau mehr.",
    },
    {
      title: "Bessere Teamfilter",
      description: "November '24",
      content: "Du kannst jetzt nach Eventtyp filtern.",
    },
    {
      title: "Ersthelfer",
      description: "November '24",
      content: "Jede(r) Mitarbeiter(in) soll sich eintragen, ob sie als Ersthelfer in Frage kommt.",
    },
  ];
  const items = [
    {
      title: "Attachments beim Mailsenden",
      description: "Oktober '24",
      content: "Du kannst jetzt Attachments an eine Mail hängen.",
    },
    {
      title: "Möglichkeit, ein Konzert ohne Presse zu definieren.",
      description: "Oktober '24",
      content:
        'Bei den Checkboxen im Konzert "Allgemeines" kann man jetzt "Braucht Presse" abwählen. Dadurch werden keine E-Mails mehr verschickt.',
    },
    {
      title: 'Infos "getIn" und "transport" für den master eingebbar.',
      description: "September '24",
      content: 'In der Veranstaltung kann man die Felder bei "Artist" pflegen und in der Preview werden sie angezeigt.',
    },
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

  return (
    <>
      <HelpSection initiallyOpen items={brandNew} label={<b>Neues</b>} />
      <HelpSection items={items} label={<b>Nicht ganz so Neues</b>} />
    </>
  );
}
