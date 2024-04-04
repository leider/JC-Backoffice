import * as React from "react";
import { useState } from "react";
import HelpVeranstaltungen from "@/components/content/help/HelpVeranstaltungen.tsx";
import HelpNeues from "@/components/content/help/HelpNeues.tsx";
import { FloatButton, Modal } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";

export default function HelpContent() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <Modal title="Neuigkeiten und Hilfe" open={helpOpen} onCancel={() => setHelpOpen(false)} footer={null}>
        <p>Dieser Dialog wird nach und nach mit Inhalten gefüllt...</p>
        <HelpNeues />
        <h2>Hilfe für aktuelle Seite</h2>
        <p>Abhängig von Deinen Benutzerrechten sind einige Dinge für Dich nicht sichtbar oder aktiv.</p>
        <HelpVeranstaltungen />
      </Modal>
      <FloatButton
        icon={
          <IconForSmallBlock
            iconName="QuestionLg"
            onClick={() => {
              setHelpOpen(true);
            }}
          />
        }
      />
    </>
  );
}
