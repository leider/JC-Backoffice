import React, { useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Flex, Typography } from "antd";
import PreisprofilSelect from "@/widgets/PreisprofilSelect";
import { NumberInput } from "@/widgets/numericInputWidgets";
import Eintrittspreise from "jc-shared/konzert/eintrittspreise";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzRow } from "@/widgets/JazzRow";
import useEinnahmen from "@/components/konzert/kosten/useEinnahmen.ts";
import useKassenSaldierer from "@/components/konzert/kasse/useKassenSaldierer.ts";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";

const preisprofilName = ["eintrittspreise", "preisprofil"];

export default function EinnahmenCard() {
  const form = useFormInstance();
  const { optionen } = useJazzContext();
  const summe = useEinnahmen();
  const { istFreigegeben } = useKassenSaldierer();

  const preisprofil = useWatch(preisprofilName, { preserve: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const eintrittspreise = useMemo(() => new Eintrittspreise(form.getFieldValue("eintrittspreise")), [form, preisprofil]);

  return (
    <Collapsible
      amount={summe}
      label={`Einnahmen / Eintritt / Zuschuss${!istFreigegeben ? " (Schätzung)" : ""}`}
      noTopBorder
      suffix="ausgaben"
    >
      <JazzRow>
        <Col span={12}>
          <PreisprofilSelect optionen={optionen} />
        </Col>
        <Col span={4}>
          <NumberInput decimals={2} disabled label="Reg" name={["eintrittspreise", "preisprofil", "regulaer"]} suffix="€" />
        </Col>
        <Col span={4}>
          <NumberInputWithDirectValue decimals={2} label="Erm" suffix="€" value={eintrittspreise.ermaessigt} />
        </Col>
        <Col span={4}>
          <NumberInputWithDirectValue decimals={2} label="Mitgl" suffix="€" value={eintrittspreise.mitglied} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          <NumberInput decimals={2} label="Reservix" name={["kasse", "einnahmenReservix"]} suffix="€" />
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
        {istFreigegeben ? (
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
          <NumberInput decimals={2} disabled label="Zuschüsse (für alte Konzerte)" name={["eintrittspreise", "zuschuss"]} suffix="€" />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled
            label="Abendkasse (Tickets)"
            name={["kasse", istFreigegeben ? "einnahmeTicketsEUR" : "nix"]}
            suffix="€"
          />
        </Col>
        <Col span={8}>
          <NumberInput decimals={0} disabled={!!istFreigegeben} label="Gäste (erw.)" name={["eintrittspreise", "erwarteteBesucher"]} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
