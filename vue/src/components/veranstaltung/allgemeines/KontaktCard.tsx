import Kontakt from "jc-shared/veranstaltung/kontakt";
import { Col, Form, Row } from "antd";
import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import _ from "lodash";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { TextField } from "@/widgets/TextField";
import TextArea from "antd/es/input/TextArea";
import SingleSelect from "@/widgets/SingleSelect";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";

type KontaktCardProps = {
  kontakte: Kontakt[];
  selector: "agentur" | "hotel";
  noTopBorder?: boolean;
};
export default function KontaktCard({ kontakte, selector, noTopBorder, children }: KontaktCardProps & PropsWithChildren) {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;

  const [auswahlen, setAuswahlen] = useState<string[]>([]);
  useEffect(() => {
    const names = _.uniq(kontakte.map((k) => k.name))
      .filter((name) => !!name)
      .sort();
    setAuswahlen(["[temporär]", "[neu]"].concat(names));
  }, [kontakte]);

  function auswahlChanged(name: string) {
    if (name === "[temporär]") {
      return;
    }
    const kontakt = kontakte.find((k) => k.name === name);
    const result = new Kontakt(kontakt);
    const values: any = {};
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
    <CollapsibleForVeranstaltung
      suffix={selector === "agentur" ? "allgemeines" : "hotel"}
      label={selector === "agentur" ? "Agentur" : "Hotel"}
      noTopBorder={noTopBorder}
    >
      <Row gutter={12}>
        <Col span={12}>
          <SingleSelect
            name={[`${selector}auswahl`]}
            label="Auswahl"
            options={auswahlen}
            initialValue="[temporär]"
            onChange={auswahlChanged}
          />
          <TextField name={[selector, "name"]} label="Name" />
        </Col>
        <Col span={12}>
          <Form.Item label={<b>Adresse:</b>} name={[selector, "adresse"]}>
            <TextArea rows={7} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <TextField name={[selector, "telefon"]} label="Telefon" />
        </Col>
        <Col span={12}>
          <TextField name={[selector, "email"]} label="E-Mail" isEmail />
        </Col>
      </Row>
      {children}
    </CollapsibleForVeranstaltung>
  );
}
