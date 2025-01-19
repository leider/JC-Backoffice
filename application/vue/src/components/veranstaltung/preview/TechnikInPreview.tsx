import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Divider } from "antd";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { riderFor } from "@/commons/loader.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function TechnikInPreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const url = useMemo(() => encodeURIComponent(veranstaltung.url || ""), [veranstaltung.url]);
  const riderQuery = useQuery({ enabled: !!url, queryKey: ["rider", "url"], queryFn: () => riderFor(url) });
  const rider = useMemo(() => riderQuery.data, [riderQuery.data]);

  const printref = useMemo(() => {
    return window.location.href.replace("vue/konzert/preview", "pdf/rider");
  }, []);

  return (
    <Collapsible suffix="technik" label="Technik">
      <JazzRow>
        {veranstaltung.technik.fluegel && (
          <Col span={24}>
            <b>Flügel stimmen!</b>
            <Divider />
          </Col>
        )}
        {veranstaltung.technik.backlineJazzclub.length > 0 && (
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
        {veranstaltung.technik.backlineRockshop.length > 0 && (
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
        {veranstaltung.technik.dateirider.length > 0 ? (
          <Col span={24}>
            <b>Dateien:</b>
            <ul>
              {map(veranstaltung.technik.dateirider, (item) => (
                <li key={item}>
                  <a href={`/files/${item}`} target="_blank" rel="noreferrer">
                    {item}
                  </a>
                </li>
              ))}
              {(rider?.boxes.length || 0) > 0 && (
                <li key="riderurl">
                  <a href={printref} target="_blank" rel="noreferrer">
                    {`Rider-${url}.pdf`}
                  </a>
                </li>
              )}
            </ul>
          </Col>
        ) : (
          (rider?.boxes.length || 0) > 0 && (
            <Col span={24}>
              <b>Dateien:</b>
              <ul>
                <li key="riderurl">
                  <a href={printref} target="_blank" rel="noreferrer">
                    {`Rider-${url}.pdf`}
                  </a>
                </li>
              </ul>
            </Col>
          )
        )}
      </JazzRow>
    </Collapsible>
  );
}
