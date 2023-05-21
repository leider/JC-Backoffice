import { Col, Popover, Row } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import React from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { PageHeader } from "@ant-design/pro-layout";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";

export default function VeranstaltungPopover({
  users,
  veranstaltung,
}: {
  veranstaltung: Veranstaltung;
  users: { label: string; value: string }[];
}) {
  function Content() {
    return (
      <div style={{ width: "100vw" }}>
        <PageHeader
          title={
            <span className={fieldHelpers.cssIconClass(veranstaltung.kopf.eventTyp)}>
              {" "}
              {veranstaltung.kopf.titelMitPrefix} {veranstaltung.kopf.presseInEcht}
            </span>
          }
          subTitle={`am ${veranstaltung.datumForDisplayShort}`}
        ></PageHeader>
        <Row gutter={12}>
          <Col lg={12}>
            <CollapsibleForVeranstaltung suffix="staff" label="Staff"></CollapsibleForVeranstaltung>
            <CollapsibleForVeranstaltung suffix="kasse" label="Eintritt und Abendkasse">
              <Row gutter={12}>
                <Col span={24}>
                  {veranstaltung.eintrittspreise.frei ? (
                    <p>Freier Eintritt (Sammelbox)</p>
                  ) : (
                    <Row gutter={12}>
                      <Col span={8}>
                        <p>{veranstaltung.eintrittspreise.regulaer} €</p>
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>
            </CollapsibleForVeranstaltung>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <Popover content={<Content />}>
      <IconForSmallBlock size={14} iconName="Eye" />
    </Popover>
  );
}
