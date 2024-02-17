import React, { useContext, useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { App, Button, Col, ConfigProvider, Form, Radio, Row, theme } from "antd";
import "easymde/dist/easymde.min.css";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import Angebot, { AngebotStatus } from "jc-shared/vermietung/angebot.ts";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { openAngebotRechnung } from "@/commons/loader.ts";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import { icons } from "@/widgets/buttonsAndIcons/Icons.tsx";
import { MarkdownEditor } from "@/widgets/MarkdownEditor.tsx";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { TextField } from "@/widgets/TextField.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function InfoCard() {
  const vermietungContext = useContext(VermietungContext);
  const { currentUser } = useJazzContext();
  const { modal } = App.useApp();

  const form = vermietungContext!.form;
  const angFields = Form.useWatch("angebot", { form, preserve: true });

  const angebot = useMemo(() => {
    return new Angebot(angFields);
  }, [angFields]);

  const startAndEnd = Form.useWatch("startAndEnd", { form, preserve: true });
  const vergangen = useMemo(() => {
    return new DatumUhrzeit(startAndEnd?.start).istVor(new DatumUhrzeit());
  }, [startAndEnd]);

  const freigabe = Form.useWatch(["angebot", "freigabe"], { form, preserve: true });
  const darfFreigeben = useMemo(() => currentUser.accessrights.darfKasseFreigeben, [currentUser.accessrights.darfKasseFreigeben]);
  const darfFreigabeAufheben = useMemo(() => currentUser.accessrights.isSuperuser, [currentUser.accessrights.isSuperuser]);

  function freigeben() {
    modal.confirm({
      type: "confirm",
      title: "Rechnung freigeben",
      content: (
        <>
          <p>
            <IconForSmallBlock color="red" iconName={"ExclamationCircleFill"} /> Nach dem Freigeben ist keine Änderung mehr möglich!
          </p>
          <p>Du musst danach noch Speichern, dabei wird die Rechnung an die Buchhaltung gesendet.</p>
        </>
      ),
      onOk: () => {
        form.setFieldValue(["angebot", "freigabe"], currentUser.name);
        form.setFieldValue(["angebot", "freigabeAm"], new Date());
      },
    });
  }

  function freigabeAufheben() {
    modal.confirm({
      type: "confirm",
      title: "Freigabe rückgängig",
      content: "Bist Du sicher?",
      onOk: () => {
        form.setFieldValue(["angebot", "freigabe"], "");
        form.setFieldValue(["angebot", "freigabeAm"], undefined);
      },
    });
  }

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
    <Collapsible suffix="angebot" label="Infos" noTopBorder>
      <Row gutter={12}>
        <Col span={24}>
          <ConfigProvider theme={{ token: { colorPrimary: token.colorSuccess } }}>
            <Form.Item name={["angebot", "status"]} initialValue="offen">
              <Radio.Group optionType="button" buttonStyle="solid" options={statusse} disabled={!!freigabe} />
            </Form.Item>
          </ConfigProvider>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <MarkdownEditor label={<b>Zusätzliche Infos:</b>} name={["angebot", "beschreibung"]} />
        </Col>
      </Row>
      {vermietungContext?.isDirty && <b>Vor dem generieren musst Du speichern!</b>}
      <Row gutter={12}>
        <Col span={6}>
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
                    disabled={vermietungContext?.isDirty || !getFieldValue("id")}
                    onClick={() => openAngebotRechnung(form.getFieldsValue(true))}
                  >
                    Generieren
                  </Button>
                </Form.Item>
              );
            }}
          />
        </Col>
        <Col span={10}>
          {vergangen &&
            (!freigabe ? (
              <Form.Item label="&nbsp;">
                <ButtonWithIcon
                  block
                  text="Rechnung freigeben..."
                  icon={"Unlock"}
                  onClick={freigeben}
                  disabled={angebot.status !== "abgerechnet" || vermietungContext?.isDirty || !darfFreigeben}
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item label="&nbsp;">
                  <ButtonWithIcon
                    block
                    icon="Lock"
                    text="Ist freigegeben"
                    type="primary"
                    color="#c71c2c"
                    onClick={freigabeAufheben}
                    disabled={vermietungContext?.isDirty || !darfFreigabeAufheben}
                  />
                </Form.Item>
                <TextField name={["angebot", "freigabe"]} label="Durch" disabled />
              </>
            ))}
        </Col>{" "}
      </Row>
    </Collapsible>
  );
}
