import { Col, Collapse, Row, theme, Typography } from "antd";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import { Link } from "react-router";
import headerTags from "@/components/colored/headerTags.tsx";
import map from "lodash/map";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import filter from "lodash/filter";
import reject from "lodash/reject";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { expandIcon } from "@/widgets/collapseExpandIcon.tsx";

function VeranstaltungenListe({ veranstaltungen }: { readonly veranstaltungen: Veranstaltung[] }) {
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

export function ProgrammheftVeranstaltungenMonat({
  monat,
  veranstaltungen,
}: {
  readonly monat: string;
  readonly veranstaltungen: Konzert[];
}) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { brightText } = useJazzContext();

  const bestaetigte = useMemo(() => filter(veranstaltungen, "kopf.confirmed"), [veranstaltungen]);
  const unbestaetigte = useMemo(() => reject(veranstaltungen, "kopf.confirmed"), [veranstaltungen]);
  const ohnePresse = useMemo(() => reject(veranstaltungen, "presse.checked"), [veranstaltungen]);

  const { token } = theme.useToken();
  const previewCol = useCallback(
    (veranst: Veranstaltung) => (
      <Col key={veranst.id} md={8} sm={12} xs={24} xxl={6}>
        <PressePreview veranstaltung={veranst} />
      </Col>
    ),
    [],
  );

  const expandUnexpand = useCallback(() => setExpanded(!expanded), [expanded]);

  return (
    <Collapse
      activeKey={expanded ? monat : undefined}
      className="monat-header"
      expandIcon={expandIcon({})}
      items={[
        {
          key: monat,
          label: (
            <Typography.Title level={4} style={{ margin: 0, color: brightText }}>
              {monat}
            </Typography.Title>
          ),
          extra: headerTags([
            { label: "Unbestätigte", color: !unbestaetigte.length },
            { label: "Presse", color: !ohnePresse.length },
          ]),
          children: (
            <RowWrapper>
              <Row>
                {!!unbestaetigte.length && (
                  <Col span={12}>
                    <Typography.Title level={4}>Es gibt noch unbestätigte Veranstaltungen</Typography.Title>
                    <VeranstaltungenListe veranstaltungen={unbestaetigte} />
                  </Col>
                )}
                {!!ohnePresse.length && (
                  <Col span={12}>
                    <Typography.Title level={4}>Hier fehlt der Pressetext</Typography.Title>
                    <VeranstaltungenListe veranstaltungen={ohnePresse} />
                  </Col>
                )}
              </Row>
              <Row gutter={[8, 8]}>{map(bestaetigte, previewCol)}</Row>
            </RowWrapper>
          ),
        },
      ]}
      onChange={expandUnexpand}
      size="small"
      style={{ backgroundColor: token.colorPrimary }}
    />
  );
}
