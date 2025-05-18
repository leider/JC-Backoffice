import React, { useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs.tsx";
import Angebot from "jc-shared/vermietung/angebot.ts";
import { TextField } from "@/widgets/TextField.tsx";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow";

function FreiRow({ nummer, readonly }: { readonly nummer: number; readonly readonly: boolean }) {
  const betrag = useWatch(["angebot", `frei${nummer}EUR`], { preserve: true });

  return (
    <JazzRow>
      <Col span={16}>
        <TextField disabled={readonly} label={`Freifeld ${nummer}`} name={["angebot", `frei${nummer}`]} required={betrag > 0} />
      </Col>
      <Col span={8}>
        <NumberInput decimals={2} disabled={readonly} label="Betrag" name={["angebot", `frei${nummer}EUR`]} suffix="€" />
      </Col>
    </JazzRow>
  );
}

export default function AngebotCard() {
  const form = useFormInstance();
  const angFields = useWatch("angebot", { form, preserve: true });
  const angebot = useMemo(() => new Angebot(angFields), [angFields]);
  const readonly = useMemo(() => !!angebot.freigabe, [angebot.freigabe]);

  return (
    <Collapsible amount={angebot.summe} label="Posten" noTopBorder suffix="angebot">
      <JazzRow>
        <Col span={8}>
          <NumberInput decimals={2} disabled={readonly} label="Saalmiete" name={["angebot", "saalmiete"]} suffix="€" />
        </Col>
        <Col span={8}>
          <NumberInput decimals={0} disabled={readonly} label="Rabatt (optional)" name={["angebot", "saalmieteRabatt"]} suffix="%" />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue decimals={2} label="Total" suffix="€" value={angebot.saalmieteTotal} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput decimals={0} disabled={readonly} label="Tontechniker (Anzahl)" name={["angebot", "tontechnikerAnzahl"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={readonly}
            label="Tontechniker (Einzelpreis)"
            name={["angebot", "tontechnikerBetrag"]}
            suffix="€"
          />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue decimals={2} label="Total" suffix="€" value={angebot.tontechnikerTotal} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput decimals={0} disabled={readonly} label="Lichttechniker (Anzahl)" name={["angebot", "lichttechnikerAnzahl"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={readonly}
            label="Lichttechniker (Einzelpreis)"
            name={["angebot", "lichttechnikerBetrag"]}
            suffix="€"
          />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue decimals={2} label="Total" suffix="€" value={angebot.lichttechnikerTotal} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput decimals={0} disabled={readonly} label="Musiker (Anzahl)" name={["angebot", "musikerAnzahl"]} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={readonly} label="Musiker (Einzelpreis)" name={["angebot", "musikerGage"]} suffix="€" />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue decimals={2} label="Total" suffix="€" value={angebot.musikerTotal} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput decimals={2} disabled={readonly} label="Flügel (Einzelpreis)" name={["angebot", "fluegel"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput decimals={0} disabled={readonly} label="Bar Personal (Anzahl)" name={["angebot", "barpersonalAnzahl"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={readonly}
            label="Bar Personal (Einzelpreis)"
            name={["angebot", "barpersonalBetrag"]}
            suffix="€"
          />
        </Col>
        <Col span={8}>
          <NumberInputWithDirectValue decimals={2} label="Total" suffix="€" value={angebot.barpersonalTotal} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput decimals={2} disabled={readonly} label="Abenddienst" name={["angebot", "abenddienst"]} suffix="€" />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={readonly} label="Reinigung Haus" name={["angebot", "reinigungHaus"]} suffix="€" />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={readonly} label="Reinigung Bar" name={["angebot", "reinigungBar"]} suffix="€" />
        </Col>
      </JazzRow>
      <FreiRow nummer={1} readonly={readonly} />
      <FreiRow nummer={2} readonly={readonly} />
      <FreiRow nummer={3} readonly={readonly} />
    </Collapsible>
  );
}
