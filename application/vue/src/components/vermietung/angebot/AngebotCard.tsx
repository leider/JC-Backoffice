import React, { useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs.tsx";
import Angebot from "jc-shared/vermietung/angebot.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { TextField } from "@/widgets/TextField.tsx";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow";

export default function AngebotCard() {
  const form = useFormInstance();

  const angFields = useWatch("angebot", { form, preserve: true });

  const angebot = useMemo(() => new Angebot(angFields), [angFields]);

  const readonly = useMemo(() => !!angebot.freigabe, [angebot.freigabe]);

  const { lg } = useBreakpoint();

  function FreiRow({ nummer }: { nummer: number }) {
    return (
      <JazzRow>
        <Col span={16}>
          <DynamicItem
            nameOfDepending={["angebot", `frei${nummer}EUR`]}
            renderWidget={(getFieldValue) => {
              const betrag = getFieldValue(["angebot", `frei${nummer}EUR`]);
              return (
                <TextField label={`Freifeld ${nummer}`} name={["angebot", `frei${nummer}`]} disabled={readonly} required={betrag > 0} />
              );
            }}
          />
        </Col>
        <Col span={8}>
          <NumberInput name={["angebot", `frei${nummer}EUR`]} label="Betrag" decimals={2} suffix="€" disabled={readonly} />
        </Col>
      </JazzRow>
    );
  }

  return (
    <Collapsible suffix="angebot" label="Posten" noTopBorder={lg} amount={angebot.summe}>
      <JazzRow>
        <Col span={8}>
          <NumberInput name={["angebot", "saalmiete"]} label="Saalmiete" decimals={2} suffix="€" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput name={["angebot", "saalmieteRabatt"]} label="Rabatt (optional)" decimals={0} suffix="%" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue label="Total" value={angebot.saalmieteTotal} decimals={2} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput name={["angebot", "tontechnikerAnzahl"]} label="Tontechniker (Anzahl)" decimals={0} disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "tontechnikerBetrag"]}
            label="Tontechniker (Einzelpreis)"
            decimals={2}
            suffix="€"
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue label="Total" value={angebot.tontechnikerTotal} decimals={2} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput name={["angebot", "lichttechnikerAnzahl"]} label="Lichttechniker (Anzahl)" decimals={0} disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "lichttechnikerBetrag"]}
            label="Lichttechniker (Einzelpreis)"
            decimals={2}
            suffix="€"
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue label="Total" value={angebot.lichttechnikerTotal} decimals={2} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput name={["angebot", "musikerAnzahl"]} label="Musiker (Anzahl)" decimals={0} disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput name={["angebot", "musikerGage"]} label="Musiker (Einzelpreis)" decimals={2} suffix="€" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue label="Total" value={angebot.musikerTotal} decimals={2} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput name={["angebot", "fluegel"]} label="Flügel (Einzelpreis)" decimals={2} suffix="€" disabled={readonly} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput name={["angebot", "barpersonalAnzahl"]} label="Bar Personal (Anzahl)" decimals={0} disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["angebot", "barpersonalBetrag"]}
            label="Bar Personal (Einzelpreis)"
            decimals={2}
            suffix="€"
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue label="Total" value={angebot.barpersonalTotal} decimals={2} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput name={["angebot", "abenddienst"]} label="Abenddienst" decimals={2} suffix="€" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput name={["angebot", "reinigungHaus"]} label="Reinigung Haus" decimals={2} suffix="€" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput name={["angebot", "reinigungBar"]} label="Reinigung Bar" decimals={2} suffix="€" disabled={readonly} />
        </Col>
      </JazzRow>
      <FreiRow nummer={1} />
      <FreiRow nummer={2} />
      <FreiRow nummer={3} />
    </Collapsible>
  );
}
