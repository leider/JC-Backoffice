import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung.tsx";
import { Col, Row } from "antd";
import React from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";

export default function KasseInPreview({ veranstaltung, url }: { veranstaltung: Veranstaltung; url?: string }) {
  function ButtonAbendkasse() {
    const { color, icon } = colorsAndIconsForSections;
    const { currentUser } = useJazzContext();
    if (!currentUser.accessrights.isAbendkasse) {
      return;
    }
    return (
      <ButtonWithIconAndLink
        block
        text="Abendkasse"
        tooltipTitle="Abendkasse"
        color={color("kasse")}
        icon={icon("kasse")}
        to={{
          pathname: `/veranstaltung/${url}`,
          search: "page=kasse",
        }}
      />
    );
  }

  return (
    <CollapsibleForVeranstaltung suffix="kasse" label="Eintritt und Abendkasse">
      <Row gutter={12}>
        <Col span={24}>
          {veranstaltung.eintrittspreise.frei ? (
            <p>Freier Eintritt (Sammelbox)</p>
          ) : (
            <Row gutter={12}>
              <Col span={8}>
                <b>{veranstaltung.eintrittspreise.regulaer},00 €</b>
              </Col>
              <Col span={8}>
                <b>{veranstaltung.eintrittspreise.ermaessigt},00 €</b>
              </Col>
              <Col span={8}>
                <b>{veranstaltung.eintrittspreise.mitglied},00 €</b>
              </Col>
            </Row>
          )}
          <Row gutter={12}>
            <Col span={10} offset={14}>
              <ButtonAbendkasse />
            </Col>{" "}
          </Row>
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
