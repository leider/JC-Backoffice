import { Col } from "antd";
import { ProgrammheftVeranstaltungenMonat } from "@/components/programmheft/ProgrammheftVeranstaltungenMonat.tsx";
import * as React from "react";
import { useEffect, useState } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import { useQuery } from "@tanstack/react-query";
import { konzerteBetweenYYYYMM } from "@/commons/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import keys from "lodash/keys";
import { JazzRow } from "@/widgets/JazzRow.tsx";

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
    const result = groupBy(veranstaltungen, "startDatumUhrzeit.monatLangJahrKompakt");
    setVeranstaltungenNachMonat(result);
    setMonate(keys(result));
  }, [veranstaltungen]);

  return map(monate, (monat) => (
    <JazzRow key={monat}>
      <Col span={24}>
        <ProgrammheftVeranstaltungenMonat monat={monat} veranstaltungen={veranstaltungenNachMonat[monat]} />
      </Col>
    </JazzRow>
  ));
}
