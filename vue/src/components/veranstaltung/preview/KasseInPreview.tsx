import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung.tsx";
import { Button, Col, ConfigProvider, Row, Tooltip } from "antd";
import React from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useColorsAndIconsForSections } from "@/components/colorsIconsForSections.ts";
import { useAuth } from "@/commons/authConsts.ts";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { useNavigate } from "react-router-dom";

export default function KasseInPreview({ veranstaltung, url }: { veranstaltung: Veranstaltung; url?: string }) {
  const navigate = useNavigate();

  function ButtonAbendkasse({ callback }: { callback: () => void }) {
    const { color, icon } = useColorsAndIconsForSections("kasse");
    const { context } = useAuth();
    if (!context?.currentUser.accessrights?.isAbendkasse) {
      return;
    }
    return (
      <ConfigProvider theme={{ token: { colorPrimary: color() } }}>
        <Tooltip title="Abendkasse" color={color()}>
          <Button block icon={<IconForSmallBlock size={16} iconName={icon()} />} type="primary" onClick={callback}>
            Abendkasse
          </Button>
        </Tooltip>
      </ConfigProvider>
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
              <ButtonAbendkasse
                callback={() =>
                  navigate({
                    pathname: `/veranstaltung/${url}`,
                    search: "page=kasse",
                  })
                }
              />
            </Col>{" "}
          </Row>
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
