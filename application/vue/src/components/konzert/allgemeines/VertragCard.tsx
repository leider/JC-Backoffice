import React, { useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Button, Col, Form, Select } from "antd";
import SingleSelect from "@/widgets/SingleSelect";
import Vertrag from "jc-shared/konzert/vertrag";
import { DynamicItem } from "@/widgets/DynamicItem";
import { openVertrag } from "@/commons/loader.ts";
import Uploader from "@/widgets/Uploader.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import { MarkdownEditor } from "@/widgets/markdown/MarkdownEditor.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function VertragCard() {
  const form = useFormInstance();
  const { currentUser, isDirty } = useJazzContext();

  const isBookingTeam = useMemo(() => currentUser.accessrights.isBookingTeam, [currentUser.accessrights.isBookingTeam]);

  return (
    <Collapsible suffix="allgemeines" label="Vertrag">
      {isDirty && <b>Vor dem generieren musst Du speichern!</b>}
      <JazzRow>
        <Col span={9}>
          <SingleSelect name={["vertrag", "art"]} label="Art" options={Vertrag.arten} />
        </Col>
        <Col span={9}>
          <Form.Item label={<b>Sprache:</b>} name={["vertrag", "sprache"]}>
            <Select options={map(Vertrag.sprachen, (s) => ({ label: s, value: s }))} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <DynamicItem
            nameOfDepending="id"
            renderWidget={(getFieldValue) => {
              return (
                <Form.Item label="&nbsp;">
                  <Button
                    block
                    type="primary"
                    disabled={isDirty || !isBookingTeam || !getFieldValue("id")}
                    onClick={() => openVertrag(new Konzert(form.getFieldsValue(true)))}
                  >
                    Generieren
                  </Button>
                </Form.Item>
              );
            }}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          <Uploader name={["vertrag", "datei"]} typ="vertrag" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          <MarkdownEditor label={<b>Zusatzvereinbarungen:</b>} name={["vertrag", "zusatzvereinbarungen"]} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
