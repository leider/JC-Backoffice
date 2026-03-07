import { Col } from "antd";
import { ProgrammheftVeranstaltungenMonat } from "@/components/programmheft/ProgrammheftVeranstaltungenMonat.tsx";
import * as React from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { konzerteBetweenYYYYMM } from "@/rest/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import keys from "lodash/keys";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export function ProgrammheftVeranstaltungenRow({ start }: { start: DatumUhrzeit }) {
  const { data: veranstaltungen } = useQuery({
    queryKey: ["konzert", `${start.yyyyMM}`],
    queryFn: () => konzerteBetweenYYYYMM(start.yyyyMM, start.plus({ monate: 2 }).yyyyMM),
  });

  const { veranstaltungenNachMonat, monate } = useMemo(() => {
    const result = groupBy(veranstaltungen, "startDatumUhrzeit.monatLangJahrKompakt");
    return { veranstaltungenNachMonat: result, monate: keys(result) };
  }, [veranstaltungen]);

  return map(monate, (monat) => (
    <JazzRow key={monat}>
      <Col span={24}>
        <ProgrammheftVeranstaltungenMonat monat={monat} veranstaltungen={veranstaltungenNachMonat[monat]} />
      </Col>
    </JazzRow>
  ));
}
