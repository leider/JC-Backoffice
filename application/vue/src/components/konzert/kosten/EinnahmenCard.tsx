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
  onChange: (sum: number) => void;
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
    <Collapsible suffix="ausgaben" label={`Einnahmen / Eintritt / Zuschuss${!freigabe ? " (Schätzung)" : ""}`} noTopBorder amount={summe}>
      <JazzRow>
        <Col span={12}>
          <PreisprofilSelect optionen={optionen} onChange={updateSumme} />
        </Col>
        <Col span={4}>
          <NumberInput name={["eintrittspreise", "preisprofil", "regulaer"]} label="Reg" decimals={2} suffix="€" disabled />
        </Col>
        <Col span={4}>
          <DynamicItem
            nameOfDepending={["eintrittspreise", "preisprofil"]}
            renderWidget={(getFieldValue) => {
              const eintritt = new Eintrittspreise(getFieldValue("eintrittspreise"));
              return <NumberInputWithDirectValue label="Erm" decimals={2} suffix="€" value={eintritt.ermaessigt} />;
            }}
          />
        </Col>
        <Col span={4}>
          <DynamicItem
            nameOfDepending={["eintrittspreise", "preisprofil"]}
            renderWidget={(getFieldValue) => {
              const eintritt = new Eintrittspreise(getFieldValue("eintrittspreise"));
              return <NumberInputWithDirectValue label="Mitgl" decimals={2} suffix="€" value={eintritt.mitglied} />;
            }}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          <NumberInput name={["kasse", "einnahmenReservix"]} label="Reservix" decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
        <Col span={12}>
          <NumberInput
            name={["kasse", "anzahlReservix"]}
            label={'Anzahl Tickets (für Excel) - falls "0" Schnitt aus Eintritt'}
            decimals={0}
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
            name={["eintrittspreise", "zuschuss"]}
            label="Zuschüsse (für alte Konzerte)"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", freigabe ? "einnahmeTicketsEUR" : "nix"]}
            label="Abendkasse (Tickets)"
            decimals={2}
            disabled
            suffix="€"
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["eintrittspreise", "erwarteteBesucher"]}
            label="Gäste (erw.)"
            decimals={0}
            onChange={updateSumme}
            disabled={!!freigabe}
          />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
