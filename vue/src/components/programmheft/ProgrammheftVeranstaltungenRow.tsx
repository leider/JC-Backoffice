import { Col, Row } from "antd";
import { ProgrammheftVeranstaltungenMonat } from "@/components/programmheft/ProgrammheftVeranstaltungenMonat.tsx";
import * as React from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useQuery } from "@tanstack/react-query";
import { veranstaltungenBetweenYYYYMM } from "@/commons/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { useEffect, useState } from "react";
import groupBy from "lodash/groupBy";

export function ProgrammheftVeranstaltungenRow({ start }: { start: DatumUhrzeit }) {
  const { data: dataveranstaltungen } = useQuery({
    queryKey: ["veranstaltung", `${start.yyyyMM}`],
    queryFn: () => veranstaltungenBetweenYYYYMM(start.yyyyMM, start.plus({ monate: 2 }).yyyyMM),
  });

  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);
  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{
    [index: string]: Veranstaltung[];
  }>({});
  const [monate, setMonate] = useState<string[]>([]);

  useEffect(() => {
    if (dataveranstaltungen) {
      setVeranstaltungen(dataveranstaltungen);
    }
  }, [dataveranstaltungen]);

  useEffect(() => {
    const result = groupBy(veranstaltungen, (veranst) => veranst.startDatumUhrzeit.monatLangJahrKompakt);
    setVeranstaltungenNachMonat(result);
    setMonate(Object.keys(result));
  }, [veranstaltungen]);

  return monate.map((monat) => (
    <Row gutter={12} key={monat}>
      <Col span={24}>
        <ProgrammheftVeranstaltungenMonat monat={monat} veranstaltungen={veranstaltungenNachMonat[monat]} />
      </Col>
    </Row>
  ));
}
