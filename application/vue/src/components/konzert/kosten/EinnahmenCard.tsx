import React, { useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Flex, Typography } from "antd";
import Konzert from "jc-shared/konzert/konzert.ts";
import PreisprofilSelect from "@/widgets/PreisprofilSelect";
import { NumberInput } from "@/widgets/numericInputWidgets";
import KonzertKalkulation from "jc-shared/konzert/konzertKalkulation.ts";
import { DynamicItem } from "@/widgets/DynamicItem";
import Eintrittspreise from "jc-shared/konzert/eintrittspreise";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow";

interface EinnahmenCardParams {
  readonly onChange: (sum: number) => void;
}
export default function EinnahmenCard({ onChange }: EinnahmenCardParams) {
  const { optionen } = useJazzContext();
  const form = useFormInstance();

  const [summe, setSumme] = useState<number>(0);
  useEffect(
    () => {
      updateSumme();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form],
  );

  function updateSumme() {
    const konzert = new Konzert(form.getFieldsValue(true));
    const kalk = new KonzertKalkulation(konzert);
    const sum = konzert.eintrittspreise.zuschuss + kalk.erwarteterOderEchterEintritt;
    setSumme(sum);
    onChange(sum);
  }

  const freigabe = useWatch(["kasse", "kassenfreigabe"], { form, preserve: true });

  return (
    <Collapsible amount={summe} label={`Einnahmen / Eintritt / Zuschuss${!freigabe ? " (Schätzung)" : ""}`} noTopBorder suffix="ausgaben">
      <JazzRow>
        <Col span={12}>
          <PreisprofilSelect onChange={updateSumme} optionen={optionen} />
        </Col>
        <Col span={4}>
          <NumberInput decimals={2} disabled label="Reg" name={["eintrittspreise", "preisprofil", "regulaer"]} suffix="€" />
        </Col>
        <Col span={4}>
          <DynamicItem
            nameOfDepending={["eintrittspreise", "preisprofil"]}
            renderWidget={(getFieldValue) => {
              const eintritt = new Eintrittspreise(getFieldValue("eintrittspreise"));
              return <NumberInputWithDirectValue decimals={2} label="Erm" suffix="€" value={eintritt.ermaessigt} />;
            }}
          />
        </Col>
        <Col span={4}>
          <DynamicItem
            nameOfDepending={["eintrittspreise", "preisprofil"]}
            renderWidget={(getFieldValue) => {
              const eintritt = new Eintrittspreise(getFieldValue("eintrittspreise"));
              return <NumberInputWithDirectValue decimals={2} label="Mitgl" suffix="€" value={eintritt.mitglied} />;
            }}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          <NumberInput decimals={2} label="Reservix" name={["kasse", "einnahmenReservix"]} onChange={updateSumme} suffix="€" />
        </Col>
        <Col span={12}>
          <NumberInput
            decimals={0}
            label='Anzahl Tickets (für Excel) - falls "0" Schnitt aus Eintritt'
            name={["kasse", "anzahlReservix"]}
          />
        </Col>
      </JazzRow>
      <Flex justify="center">
        {freigabe ? (
          <Typography.Text strong type="success">
            Kasse ist freigegeben, verwende "Abendkasse"
          </Typography.Text>
        ) : (
          <Typography.Text strong type="danger">
            Schätzung, da Kasse noch nicht freigegeben, verwende "Gäste (erw.)"
          </Typography.Text>
        )}
      </Flex>
      <JazzRow>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled
            label="Zuschüsse (für alte Konzerte)"
            name={["eintrittspreise", "zuschuss"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled
            label="Abendkasse (Tickets)"
            name={["kasse", freigabe ? "einnahmeTicketsEUR" : "nix"]}
            suffix="€"
          />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={0}
            disabled={!!freigabe}
            label="Gäste (erw.)"
            name={["eintrittspreise", "erwarteteBesucher"]}
            onChange={updateSumme}
          />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
