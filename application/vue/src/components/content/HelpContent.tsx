import * as React from "react";
import { useMemo, useState } from "react";
import HelpVeranstaltungen from "@/components/content/help/HelpVeranstaltungen.tsx";
import HelpNeues from "@/components/content/help/HelpNeues.tsx";
import { FloatButton, Typography } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { useLocation } from "react-router";
import HelpTeam from "@/components/content/help/HelpTeam.tsx";
import HelpKonzert from "@/components/content/help/HelpKonzert.tsx";
import HelpWiki from "@/components/content/help/HelpWiki.tsx";
import HelpPrefs from "@/components/content/help/HelpPrefs.tsx";
import { JazzModal } from "@/widgets/JazzModal.tsx";

export default function HelpContent() {
  const { pathname } = useLocation();

  const [helpOpen, setHelpOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const hasHelp = useMemo(() => {
    return pathname === "/veranstaltungen" || pathname === "/team" || pathname.startsWith("/konzert") || pathname.startsWith("/wiki");
  }, [pathname]);

  return (
    <>
      <JazzModal width={600} title="Hilfe" open={helpOpen} onCancel={() => setHelpOpen(false)} footer={null}>
        <Typography.Title level={4}>Hilfe für aktuelle Seite</Typography.Title>
        <p>Abhängig von Deinen Benutzerrechten sind einige Dinge für Dich nicht sichtbar oder aktiv.</p>
        <HelpPrefs />
        <HelpVeranstaltungen />
        <HelpTeam />
        <HelpKonzert />
        <HelpWiki />
      </JazzModal>
      <JazzModal width={600} title="Neuigkeiten" open={infoOpen} onCancel={() => setInfoOpen(false)} footer={null}>
        <p>Dieser Dialog wird nach und nach mit Inhalten gefüllt...</p>
        <HelpNeues />
      </JazzModal>
      <FloatButton.Group trigger="click" icon={<IconForSmallBlock iconName="QuestionLg" />}>
        {hasHelp && (
          <FloatButton
            icon={<IconForSmallBlock iconName="QuestionLg" />}
            onClick={() => {
              setHelpOpen(true);
            }}
          />
        )}
        <FloatButton
          icon={<IconForSmallBlock iconName="InfoLg" />}
          onClick={() => {
            setInfoOpen(true);
          }}
        />
      </FloatButton.Group>
    </>
  );
}
