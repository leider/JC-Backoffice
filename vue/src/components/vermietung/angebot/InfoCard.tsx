import React, { useContext, useMemo } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, ConfigProvider, Form, Radio, Row } from "antd";
import SimpleMdeReact from "react-simplemde-editor";
import { IconForSmallBlock, icons } from "@/components/Icon.tsx";
import { AngebotStatus } from "jc-shared/vermietung/angebot.ts";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { openAngebotRechnung } from "@/commons/loader.ts";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";

export default function InfoCard() {
  const veranstContext = useContext(VermietungContext);
  const form = veranstContext!.form;

  const statusse = useMemo(() => {
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

    return [
      radioOption("QuestionCircleFill", "Angebot", "offen"),
      radioOption("ExclamationCircleFill", "Verschickt", "verschickt"),
      radioOption("CheckCircleFill", "Angenommen", "angenommen"),
      radioOption("Coin", "Rechnung", "abgerechnet"),
    ];
  }, []);

  return (
    <CollapsibleForVeranstaltung suffix="angebot" label="Infos" noTopBorder>
      <Row gutter={12}>
        <Col span={24}>
          <ConfigProvider theme={{ token: { colorPrimary: "#328300" } }}>
            <Form.Item name={["angebot", "status"]} initialValue="offen">
              <Radio.Group optionType="button" buttonStyle="solid" options={statusse} />
            </Form.Item>
          </ConfigProvider>
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
