import { useJazzContext } from "@/components/content/useJazzContext.ts";
import * as React from "react";
import { useMemo } from "react";
import filter from "lodash/filter";
import { Col, Row } from "antd";
import map from "lodash/map";
import { Link } from "react-router";

export default function TodaysConcert() {
  const { todayKonzerte } = useJazzContext();
  const bestaetigte = useMemo(() => filter(todayKonzerte, { kopf: { confirmed: true, abgesagt: false } }), [todayKonzerte]);

  const colsMd = useMemo(() => {
    if (bestaetigte.length === 1) {
      return 24;
    }
    return 12;
  }, [bestaetigte.length]);

  const colXxl = useMemo(() => {
    switch (bestaetigte.length) {
      case 1:
        return 24;
      case 2:
        return 12;
      case 3:
        return 8;
      default:
        return 6;
    }
  }, [bestaetigte.length]);

  if (bestaetigte?.length) {
    return (
      <Row gutter={6} style={{ marginTop: 8 }}>
        {map(bestaetigte, (konzert) => {
          return (
            <Col key={konzert.fullyQualifiedPreviewUrl} md={colsMd} xs={24} xxl={colXxl}>
              <Link style={{ color: konzert.colorText }} to={konzert.fullyQualifiedPreviewUrl}>
                <h3
                  style={{
                    marginBottom: 0,
                    marginTop: 0,
                    textAlign: "center",
                    backgroundColor: konzert.color,
                    textDecoration: konzert.kopf.abgesagt ? "line-through" : "",
                  }}
                >
                  {konzert.startDatumUhrzeit.wochentagUhrzeitKompakt}: {konzert.kopf.titel}
                </h3>
              </Link>
            </Col>
          );
        })}
      </Row>
    );
  }
}
