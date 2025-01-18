import * as React from "react";
import { useLocation } from "react-router";
import HelpSection from "@/components/content/help/HelpSection.tsx";

export default function HelpWiki() {
  const { pathname } = useLocation();

  const wiki = [
    {
      title: "Was sehe ich?",
      content: "Seiten, die von unseren Admins erstellt werden können",
    },
    {
      title: "Bearbeiten und Speichern",
      content: "Geht nur für Admins",
    },
  ];

  return (
    pathname.startsWith("/wiki") && (
      <HelpSection
        initiallyOpen={true}
        label={
          <span>
            <b>Wiki</b> Schau selbst:
          </span>
        }
        items={wiki}
      />
    )
  );
}
