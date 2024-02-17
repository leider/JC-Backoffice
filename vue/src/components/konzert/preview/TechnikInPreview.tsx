import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Divider, Row } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import Konzert from "../../../../../shared/konzert/konzert.ts";
import { Rider } from "jc-shared/rider/rider.ts";
import { useQuery } from "@tanstack/react-query";
import { riderFor } from "@/commons/loader.ts";

export default function TechnikInPreview({ konzert, url }: { konzert: Konzert; url?: string }) {
  const riderQuery = useQuery({ queryKey: ["rider", "url"], queryFn: () => riderFor(url || "") });
  const [rider, setRider] = useState<Rider>(new Rider());
  useEffect(() => {
    if (riderQuery.data) {
      setRider(riderQuery.data);
    }
  }, [riderQuery.data]);

  const printref = useMemo(() => {
    return window.location.href.replace("vue/veranstaltung/preview", "pdf/rider");
  }, []);

  return (
    <Collapsible suffix="technik" label="Technik">
      <Row gutter={12}>
        {konzert.technik.fluegel && (
          <Col span={24}>
            <b>Flügel stimmen!</b>
            <Divider />
          </Col>
        )}
        {konzert.technik.backlineJazzclub.length > 0 && (
          <Col span={24}>
            <b>Backline Jazzclub:</b>
            <ul>
              {konzert.technik.backlineJazzclub.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Divider />
          </Col>
        )}
        {konzert.technik.backlineRockshop.length > 0 && (
          <Col span={24}>
            <b>Backline Rockshop:</b>
            <ul>
              {konzert.technik.backlineRockshop.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Divider />
          </Col>
        )}
        {konzert.technik.dateirider.length > 0 ? (
          <Col span={24}>
            <b>Dateien:</b>
            <ul>
              {konzert.technik.dateirider.map((item) => (
                <li key={item}>
                  <a href={`/files/${item}`} target="_blank">
                    {item}
                  </a>
                </li>
              ))}
              {rider?.boxes.length > 0 && (
                <li key="riderurl">
                  <a href={printref} target="_blank">
                    {`Rider-${url}.pdf`}
                  </a>
                </li>
              )}
            </ul>
          </Col>
        ) : (
          rider?.boxes.length > 0 && (
            <Col span={24}>
              <b>Dateien:</b>
              <ul>
                <li key="riderurl">
                  <a href={printref} target="_blank">
                    {`Rider-${url}.pdf`}
                  </a>
                </li>
              </ul>
            </Col>
          )
        )}
      </Row>
    </Collapsible>
  );
}
