import { Col, Collapse, ConfigProvider, Row, theme, Typography } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import * as React from "react";
import { useMemo, useState } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import { Link } from "react-router";
import headerTags from "@/components/colored/headerTags.tsx";
import map from "lodash/map";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

function VeranstaltungenListe({ veranstaltungen }: { veranstaltungen: Veranstaltung[] }) {
  return (
    <ul>
      {map(veranstaltungen, (veranst) => (
        <li key={veranst.id}>
          <Link to={{ pathname: `/konzert/${encodeURIComponent(veranst.url || "")}`, search: "page=allgemeines" }}>
            {veranst.kopf.titelMitPrefix}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ProgrammheftVeranstaltungenMonat({ monat, veranstaltungen }: { monat: string; veranstaltungen: Konzert[] }) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const bestaetigte = useMemo(() => veranstaltungen.filter((v) => v.kopf.confirmed), [veranstaltungen]);
  const unbestaetigte = useMemo(() => veranstaltungen.filter((v) => !v.kopf.confirmed), [veranstaltungen]);
  const ohnePresse = useMemo(() => veranstaltungen.filter((v) => !v.presse.checked), [veranstaltungen]);

  const { token } = theme.useToken();
  return (
    <Collapse
      size={"small"}
      className="monat-header"
      style={{ backgroundColor: token.colorPrimary }}
      activeKey={expanded ? monat : undefined}
      onChange={() => {
        setExpanded(!expanded);
      }}
      expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
      items={[
        {
          key: monat,
          label: (
            <Typography.Title level={4} style={{ margin: 0, color: "#FFF" }}>
              {monat}
            </Typography.Title>
          ),
          extra: (
            <ConfigProvider theme={{ token: { fontSize: 11 } }}>
              {headerTags([
                { label: "Unbestätigte", color: !unbestaetigte.length },
                { label: "Presse", color: !ohnePresse.length },
              ])}
            </ConfigProvider>
          ),
          children: (
            <RowWrapper>
              <Row>
                {!!unbestaetigte.length && (
                  <Col span={12}>
                    <h2>Es gibt noch unbestätigte Veranstaltungen</h2>
                    <VeranstaltungenListe veranstaltungen={unbestaetigte} />
                  </Col>
                )}
                {!!ohnePresse.length && (
                  <Col span={12}>
                    <h2>Hier fehlt der Pressetext</h2>
                    <VeranstaltungenListe veranstaltungen={ohnePresse} />
                  </Col>
                )}
              </Row>
              <Row gutter={[8, 8]}>
                {map(bestaetigte, (veranst) => (
                  <Col key={veranst.id} xs={24} sm={12} md={8} xxl={6}>
                    <PressePreview veranstaltung={veranst} />
                  </Col>
                ))}
              </Row>
            </RowWrapper>
          ),
        },
      ]}
    />
  );
}
