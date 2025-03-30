import Kontakt from "jc-shared/veranstaltung/kontakt.ts";
import { Col, Form, Select } from "antd";
import React, { PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { TextField } from "@/widgets/TextField";
import TextArea from "antd/es/input/TextArea";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import find from "lodash/find";
import map from "lodash/map";
import sortedUniq from "lodash/sortedUniq";
import compact from "lodash/compact";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";
import { JazzFormContext } from "@/components/content/useJazzFormContext.ts";

type KontaktCardProps = {
  readonly kontakte: Kontakt[];
  readonly selector: "agentur" | "hotel";
  readonly noTopBorder?: boolean;
};
export default function KontaktCard({ kontakte, selector, noTopBorder, children }: KontaktCardProps & PropsWithChildren) {
  const form = useFormInstance();
  const jazzFormContext = useContext(JazzFormContext);
  const { agenturauswahl, setAgenturauswahl, hotelauswahl, setHotelauswahl } = useContext(KonzertContext);

  const [auswahlen, setAuswahlen] = useState<string[]>([]);
  useEffect(() => {
    const names = sortedUniq(compact(map(kontakte, "name")));
    setAuswahlen(["[temporär]", "[neu]"].concat(names));
  }, [kontakte]);

  const realOptions = useMemo(() => map(auswahlen, (opt) => ({ label: opt, value: opt })), [auswahlen]);

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
    if (selector === "agentur") {
      setAgenturauswahl(name);
    } else if (selector === "hotel") {
      setHotelauswahl(name);
    }
    jazzFormContext.checkDirty();
  }

  return (
    <Collapsible
      label={selector === "agentur" ? "Agentur" : "Hotel"}
      noTopBorder={noTopBorder}
      suffix={selector === "agentur" ? "allgemeines" : "hotel"}
    >
      <JazzRow>
        <Col span={12}>
          <Form.Item label={<b>Auswahl:</b>}>
            <Select
              onChange={auswahlChanged}
              options={realOptions}
              showSearch
              value={selector === "agentur" ? agenturauswahl : hotelauswahl}
            />
          </Form.Item>
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
