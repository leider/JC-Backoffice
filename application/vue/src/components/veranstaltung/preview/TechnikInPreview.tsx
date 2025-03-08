import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Divider } from "antd";
import React, { useMemo } from "react";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

export default function TechnikInPreview({ veranstaltung }: { veranstaltung: Vermietung | KonzertWithRiderBoxes }) {
  const url = useMemo(() => encodeURIComponent(veranstaltung.url || ""), [veranstaltung.url]);

  const boxes = !veranstaltung.isVermietung ? ((veranstaltung as KonzertWithRiderBoxes).riderBoxes ?? []) : [];
  const hasRiderBoxes = !!boxes.length;

  const printref = useMemo(() => {
    return window.location.href.replace("vue/konzert/preview", "pdf/rider");
  }, []);

  return (
    <Collapsible label="Technik" suffix="technik">
      <JazzRow>
        {veranstaltung.technik.fluegel && (
          <Col span={24}>
            <b>Flügel stimmen!</b>
            <Divider />
          </Col>
        )}
        {!!veranstaltung.technik.backlineJazzclub.length && (
          <Col span={24}>
            <b>Backline Jazzclub:</b>
            <ul>
              {map(veranstaltung.technik.backlineJazzclub, (item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Divider />
          </Col>
        )}
        {!!veranstaltung.technik.backlineRockshop.length && (
          <Col span={24}>
            <b>Backline Rockshop:</b>
            <ul>
              {map(veranstaltung.technik.backlineRockshop, (item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Divider />
          </Col>
        )}
        {veranstaltung.technik.dateirider.length ? (
          <Col span={24}>
            <b>Dateien:</b>
            <ul>
              {map(veranstaltung.technik.dateirider, (item) => (
                <li key={item}>
                  <a href={`/files/${item}`} rel="noreferrer" target="_blank">
                    {item}
                  </a>
                </li>
              ))}
              {hasRiderBoxes && (
                <li key="riderurl">
                  <a href={printref} rel="noreferrer" target="_blank">{`Rider-${url}.pdf`}</a>
                </li>
              )}
            </ul>
          </Col>
        ) : (
          hasRiderBoxes && (
            <Col span={24}>
              <b>Dateien:</b>
              <ul>
                <li key="riderurl">
                  <a href={printref} rel="noreferrer" target="_blank">{`Rider-${url}.pdf`}</a>
                </li>
              </ul>
            </Col>
          )
        )}
      </JazzRow>
    </Collapsible>
  );
}
