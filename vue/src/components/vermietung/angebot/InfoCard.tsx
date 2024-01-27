import React, { useContext, useMemo } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Button, Col, ConfigProvider, Form, Radio, Row, theme } from "antd";
import "easymde/dist/easymde.min.css";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { AngebotStatus } from "jc-shared/vermietung/angebot.ts";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { openAngebotRechnung } from "@/commons/loader.ts";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import { icons } from "@/widgets/buttonsAndIcons/Icons.tsx";
import { MarkdownEditor } from "@/widgets/MarkdownEditor.tsx";

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

  const { useToken } = theme;
  const token = useToken().token;
  return (
    <CollapsibleForVeranstaltung suffix="angebot" label="Infos" noTopBorder>
      <Row gutter={12}>
        <Col span={24}>
          <ConfigProvider theme={{ token: { colorPrimary: token.colorSuccess } }}>
            <Form.Item name={["angebot", "status"]} initialValue="offen">
              <Radio.Group optionType="button" buttonStyle="solid" options={statusse} />
            </Form.Item>
          </ConfigProvider>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <MarkdownEditor label={<b>Zusätzliche Infos:</b>} name={["angebot", "beschreibung"]} />
        </Col>
      </Row>
      {veranstContext?.isDirty && <b>Vor dem generieren musst Du speichern!</b>}
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
                    disabled={veranstContext?.isDirty || !getFieldValue("id")}
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
