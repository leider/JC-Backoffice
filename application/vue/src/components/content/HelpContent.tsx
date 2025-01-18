import * as React from "react";
import { useMemo, useState } from "react";
import HelpVeranstaltungen from "@/components/content/help/HelpVeranstaltungen.tsx";
import HelpNeues from "@/components/content/help/HelpNeues.tsx";
import { FloatButton, Modal } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { useLocation } from "react-router";
import HelpTeam from "@/components/content/help/HelpTeam.tsx";
import HelpKonzert from "@/components/content/help/HelpKonzert.tsx";
import HelpWiki from "@/components/content/help/HelpWiki.tsx";

export default function HelpContent() {
  const { pathname } = useLocation();

  const [helpOpen, setHelpOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const hasHelp = useMemo(() => {
    return pathname === "/veranstaltungen" || pathname === "/team" || pathname.startsWith("/konzert") || pathname.startsWith("/wiki");
  }, [pathname]);

  return (
    <>
      <Modal width={600} title="Hilfe" open={helpOpen} onCancel={() => setHelpOpen(false)} footer={null}>
        <h3>Hilfe für aktuelle Seite</h3>
        <p>Abhängig von Deinen Benutzerrechten sind einige Dinge für Dich nicht sichtbar oder aktiv.</p>
        <HelpVeranstaltungen />
        <HelpTeam />
        <HelpKonzert />
        <HelpWiki />
      </Modal>
      <Modal width={600} title="Neuigkeiten" open={infoOpen} onCancel={() => setInfoOpen(false)} footer={null}>
        <p>Dieser Dialog wird nach und nach mit Inhalten gefüllt...</p>
        <HelpNeues />
      </Modal>
      <FloatButton.Group trigger="click" style={{ right: 24 }} icon={<IconForSmallBlock iconName="QuestionLg" />}>
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
