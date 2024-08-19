import React, { useContext, useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Button, Col, Form, Row, Select } from "antd";
import SingleSelect from "@/widgets/SingleSelect";
import Vertrag from "jc-shared/konzert/vertrag";
import { DynamicItem } from "@/widgets/DynamicItem";
import { openVertrag } from "@/commons/loader.ts";
import Uploader from "@/widgets/Uploader.tsx";
import { KonzertContext } from "@/components/konzert/KonzertComp";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import { MarkdownEditor } from "@/widgets/MarkdownEditor.tsx";

export default function VertragCard() {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;

  const { currentUser } = useJazzContext();

  const isBookingTeam = useMemo(() => currentUser.accessrights.isBookingTeam, [currentUser.accessrights.isBookingTeam]);

  return (
    <Collapsible suffix="allgemeines" label="Vertrag">
      {konzertContext?.isDirty && <b>Vor dem generieren musst Du speichern!</b>}
      <Row gutter={12}>
        <Col span={9}>
          <SingleSelect name={["vertrag", "art"]} label="Art" options={Vertrag.arten()} />
        </Col>
        <Col span={9}>
          <Form.Item label={<b>Sprache:</b>} name={["vertrag", "sprache"]}>
            <Select options={Vertrag.sprachen().map((s) => ({ label: s, value: s }))} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <DynamicItem
            nameOfDepending={"id"}
            renderWidget={(getFieldValue) => {
              return (
                <Form.Item label="&nbsp;">
                  <Button
                    block
                    type="primary"
                    disabled={konzertContext?.isDirty || !isBookingTeam || !getFieldValue("id")}
                    onClick={() => openVertrag(new Konzert(form.getFieldsValue(true)))}
                  >
                    Generieren
                  </Button>
                </Form.Item>
              );
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <Uploader form={form} name={["vertrag", "datei"]} typ={"vertrag"} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <MarkdownEditor label={<b>Zusatzvereinbarungen:</b>} name={["vertrag", "zusatzvereinbarungen"]} />
        </Col>
      </Row>
    </Collapsible>
  );
}
