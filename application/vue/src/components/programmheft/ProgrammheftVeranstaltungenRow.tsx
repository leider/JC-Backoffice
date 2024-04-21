import { Col, Row } from "antd";
import { ProgrammheftVeranstaltungenMonat } from "@/components/programmheft/ProgrammheftVeranstaltungenMonat.tsx";
import * as React from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import { useQuery } from "@tanstack/react-query";
import { konzerteBetweenYYYYMM } from "@/commons/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { useEffect, useState } from "react";
import groupBy from "lodash/groupBy";

export function ProgrammheftVeranstaltungenRow({ start }: { start: DatumUhrzeit }) {
  const { data: dataveranstaltungen } = useQuery({
    queryKey: ["konzert", `${start.yyyyMM}`],
    queryFn: () => konzerteBetweenYYYYMM(start.yyyyMM, start.plus({ monate: 2 }).yyyyMM),
  });

  const [veranstaltungen, setVeranstaltungen] = useState<Konzert[]>([]);
  const [veranstaltungenNachMonat, setVeranstaltungenNachMonat] = useState<{
    [index: string]: Konzert[];
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
