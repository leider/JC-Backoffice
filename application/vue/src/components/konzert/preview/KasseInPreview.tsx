import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import React from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function KasseInPreview({ konzert, url }: { konzert: Konzert; url?: string }) {
  function ButtonAbendkasse() {
    const { color, icon } = colorsAndIconsForSections;
    const { currentUser } = useJazzContext();
    if (currentUser.id && !currentUser.accessrights.isAbendkasse) {
      return;
    }
    return (
      <ButtonWithIconAndLink
        alwaysText
        block
        text="Abendkasse"
        tooltipTitle="Abendkasse"
        color={color("kasse")}
        icon={icon("kasse")}
        to={{
          pathname: `/konzert/${url}`,
          search: "page=kasse",
        }}
      />
    );
  }

  return (
    <Collapsible suffix="kasse" label="Eintritt und Abendkasse">
      <JazzRow>
        <Col span={24}>
          {konzert.eintrittspreise.frei ? (
            <p>Freier Eintritt (Sammelbox)</p>
          ) : (
            <JazzRow>
              <Col span={8}>
                <b>{konzert.eintrittspreise.regulaer},00 €</b>
              </Col>
              <Col span={8}>
                <b>{konzert.eintrittspreise.ermaessigt},00 €</b>
              </Col>
              <Col span={8}>
                <b>{konzert.eintrittspreise.mitglied},00 €</b>
              </Col>
            </JazzRow>
          )}
          <JazzRow>
            <Col span={10} offset={14}>
              <ButtonAbendkasse />
            </Col>
          </JazzRow>
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
