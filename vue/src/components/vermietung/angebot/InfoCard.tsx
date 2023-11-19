import React, { useContext } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, ConfigProvider, Form, Radio, Row } from "antd";
import SimpleMdeReact from "react-simplemde-editor";
import { IconForSmallBlock } from "@/components/Icon.tsx";
import * as icons from "react-bootstrap-icons";
import { AngebotStatus } from "jc-shared/vermietung/angebot.ts";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { openAngebotRechnung } from "@/commons/loader.ts";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";

export default function InfoCard() {
  const veranstContext = useContext(VermietungContext);
  const form = veranstContext!.form;

  function radioOption(icon: keyof typeof icons, label: string, value: AngebotStatus) {
    return {
      label: (
        <b>
          <IconForSmallBlock iconName={icon} /> &nbsp; {label}
        </b>
      ),
      value: value,
    };
  }

  return (
    <CollapsibleForVeranstaltung suffix="angebot" label="Infos" noTopBorder>
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item name={["angebot", "status"]} label={<b>Status:</b>} initialValue="offen">
            <ConfigProvider theme={{ token: { colorPrimary: "#328300" } }}>
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                options={[
                  radioOption("QuestionCircleFill", "Angebot", "offen"),
                  radioOption("ExclamationCircleFill", "Verschickt", "verschickt"),
                  radioOption("CheckCircleFill", "Angenommen", "angenommen"),
                  radioOption("Coin", "Rechnung", "abgerechnet"),
                ]}
              />
            </ConfigProvider>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item label={<b>Zusätzliche Infos:</b>} name={["angebot", "beschreibung"]}>
            <SimpleMdeReact options={{ status: false, spellChecker: false }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <SingleSelect name={"art"} label="Art" options={["Angebot", "Vertrag", "Rechnung"]} />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending={"id"}
            renderWidget={(getFieldValue) => {
              return (
                <Form.Item label="&nbsp;">
                  <Button
                    block
                    type="primary"
                    disabled={!getFieldValue("id")}
                    onClick={() => openAngebotRechnung(form.getFieldsValue(true))}
                  >
                    Generieren
                  </Button>
                </Form.Item>
              );
            }}
          />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
