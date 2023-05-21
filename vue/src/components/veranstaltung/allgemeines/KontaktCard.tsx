import Kontakt from "jc-shared/veranstaltung/kontakt";
import { Col, Form, FormInstance, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { TextField } from "@/widgets-react/TextField";
import TextArea from "antd/es/input/TextArea";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

type KontaktCardProps = {
  kontakte: Kontakt[];
  form: FormInstance<Veranstaltung>;
  selector: "agentur" | "hotel";
};
export default function KontaktCard({ kontakte, form, selector }: KontaktCardProps) {
  const [auswahlen, setAuswahlen] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    const names = _.uniq(kontakte.map((k) => k.name))
      .filter((name) => !!name)
      .sort();
    setAuswahlen(
      ["[temporär]", "[neu]"].concat(names).map((name) => ({
        label: name,
        value: name,
      }))
    );
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
  const { lg } = useBreakpoint();
  return (
    <CollapsibleForVeranstaltung
      suffix={selector === "agentur" ? "allgemeines" : "hotel"}
      label={selector === "agentur" ? "Agentur" : "Hotel"}
      noTopBorder={lg}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item label={<b>Auswahl:</b>}>
            <Select options={auswahlen} defaultValue="[temporär]" onSelect={auswahlChanged} />
          </Form.Item>
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
    </CollapsibleForVeranstaltung>
  );
}
