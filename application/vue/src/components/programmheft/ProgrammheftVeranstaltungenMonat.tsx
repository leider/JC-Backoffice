import { Col, Collapse, ConfigProvider, Row, Typography } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import * as React from "react";
import { useMemo, useState } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import { Link } from "react-router";
import headerTags from "@/components/colored/headerTags.tsx";

export function ProgrammheftVeranstaltungenMonat({ monat, veranstaltungen }: { monat: string; veranstaltungen: Konzert[] }) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const bestaetigte = useMemo(() => veranstaltungen.filter((v) => v.kopf.confirmed), [veranstaltungen]);
  const unbestaetigte = useMemo(() => veranstaltungen.filter((v) => !v.kopf.confirmed), [veranstaltungen]);
  const ohnePresse = useMemo(() => veranstaltungen.filter((v) => !v.presse.checked), [veranstaltungen]);

  return (
    <Collapse
      size={"small"}
      className="monat-header"
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
                    <ul>
                      {unbestaetigte.map((veranst) => (
                        <li key={veranst.id}>
                          <Link
                            to={{
                              pathname: `/konzert/${encodeURIComponent(veranst.url || "")}`,
                              search: "page=allgemeines",
                            }}
                          >
                            {veranst.kopf.titelMitPrefix}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Col>
                )}
                {!!ohnePresse.length && (
                  <Col span={12}>
                    <h2>Hier fehlt der Pressetext</h2>
                    <ul>
                      {ohnePresse.map((veranst) => (
                        <li key={veranst.id}>
                          <Link
                            to={{
                              pathname: `/konzert/${encodeURIComponent(veranst.url || "")}`,
                              search: "page=presse",
                            }}
                          >
                            {veranst.kopf.titelMitPrefix}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Col>
                )}
              </Row>
              <Row gutter={[8, 8]}>
                {bestaetigte.map((veranst) => (
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
