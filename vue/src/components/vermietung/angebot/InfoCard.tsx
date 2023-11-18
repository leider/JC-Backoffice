import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, ConfigProvider, Form, Radio, Row } from "antd";
import SimpleMdeReact from "react-simplemde-editor";
import { IconForSmallBlock } from "@/components/Icon.tsx";
import * as icons from "react-bootstrap-icons";
import { AngebotStatus } from "jc-shared/vermietung/angebot.ts";

export default function InfoCard() {
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
    </CollapsibleForVeranstaltung>
  );
}
