import Kontakt from "jc-shared/veranstaltung/kontakt.ts";
import { Col, Form } from "antd";
import React, { PropsWithChildren, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { TextField } from "@/widgets/TextField";
import TextArea from "antd/es/input/TextArea";
import SingleSelect from "@/widgets/SingleSelect";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import find from "lodash/find";
import map from "lodash/map";
import sortedUniq from "lodash/sortedUniq";
import compact from "lodash/compact";
import { JazzRow } from "@/widgets/JazzRow.tsx";

type KontaktCardProps = {
  readonly kontakte: Kontakt[];
  readonly selector: "agentur" | "hotel";
  readonly noTopBorder?: boolean;
};
export default function KontaktCard({ kontakte, selector, noTopBorder, children }: KontaktCardProps & PropsWithChildren) {
  const form = useFormInstance();

  const [auswahlen, setAuswahlen] = useState<string[]>([]);
  useEffect(() => {
    const names = sortedUniq(compact(map(kontakte, "name")));
    setAuswahlen(["[temporär]", "[neu]"].concat(names));
  }, [kontakte]);

  function auswahlChanged(name: string) {
    if (name === "[temporär]") {
      return;
    }
    const result = new Kontakt(find(kontakte, { name: name }));
    const values: {
      agentur?: { adresse: string; ansprechpartner: string; email: string; name: string; telefon: string };
      hotel?: { adresse: string; ansprechpartner: string; email: string; name: string; telefon: string };
    } = {};
    values[selector] = {
      adresse: result.adresse,
      ansprechpartner: result.ansprechpartner,
      email: result.email,
      name: result.name,
      telefon: result.telefon,
    };
    form.setFieldsValue(values);
  }
  return (
    <Collapsible
      label={selector === "agentur" ? "Agentur" : "Hotel"}
      noTopBorder={noTopBorder}
      suffix={selector === "agentur" ? "allgemeines" : "hotel"}
    >
      <JazzRow>
        <Col span={12}>
          <SingleSelect
            initialValue="[temporär]"
            label="Auswahl"
            name={[`${selector}auswahl`]}
            onChange={auswahlChanged}
            options={auswahlen}
          />
          <TextField label="Name" name={[selector, "name"]} />
        </Col>
        <Col span={12}>
          <Form.Item label={<b>Adresse:</b>} name={[selector, "adresse"]}>
            <TextArea rows={7} />
          </Form.Item>
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          <TextField label="Telefon" name={[selector, "telefon"]} />
        </Col>
        <Col span={12}>
          <TextField isEmail label="E-Mail" name={[selector, "email"]} />
        </Col>
      </JazzRow>
      {children}
    </Collapsible>
  );
}
