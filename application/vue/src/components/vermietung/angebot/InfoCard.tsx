import React, { useContext, useEffect, useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { App, Button, Col, ConfigProvider, Form, Radio, theme } from "antd";
import "easymde/dist/easymde.min.css";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { AngebotStatus } from "jc-shared/vermietung/angebot.ts";
import SingleSelect from "@/widgets/SingleSelect.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { openAngebotRechnung } from "@/rest/loader.ts";
import { icons } from "@/widgets/buttonsAndIcons/Icons.tsx";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { TextField } from "@/widgets/TextField.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { JazzFormContext } from "@/components/content/useJazzFormContext.ts";

export default function InfoCard() {
  const form = useFormInstance<Vermietung>();
  const { currentUser, isDirty } = useJazzContext();
  const { checkDirty } = useContext(JazzFormContext);

  const status = useWatch(["angebot", "status"], { form, preserve: true });

  const startDate = useWatch("startDate", { form, preserve: true });
  const vergangen = useMemo(() => {
    return DatumUhrzeit.forJSDate(startDate).istVor(new DatumUhrzeit());
  }, [startDate]);

  const freigabe = useWatch(["angebot", "freigabe"], { form, preserve: true });
  useEffect(() => {
    checkDirty();
  }, [checkDirty, freigabe]);

  const darfFreigeben = useMemo(() => currentUser.accessrights.darfKasseFreigeben, [currentUser.accessrights.darfKasseFreigeben]);
  const darfFreigabeAufheben = useMemo(() => currentUser.accessrights.isSuperuser, [currentUser.accessrights.isSuperuser]);

  const { modal } = App.useApp();
  function freigeben() {
    modal.confirm({
      type: "confirm",
      title: "Rechnung freigeben",
      content: (
        <>
          <p>
            <IconForSmallBlock color="red" iconName="ExclamationCircleFill" /> Nach dem Freigeben ist keine Änderung mehr möglich!
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

  const printOptions = useMemo(() => {
    return status === "abgerechnet" ? ["Angebot", "Vertrag", "Rechnung"] : ["Angebot", "Vertrag"];
  }, [status]);

  const { useToken } = theme;
  const token = useToken().token;
  return (
    <Collapsible label="Infos" suffix="angebot">
      <JazzRow>
        <Col span={24}>
          <ConfigProvider theme={{ token: { colorPrimary: token.colorSuccess } }}>
            <Form.Item initialValue="offen" name={["angebot", "status"]}>
              <Radio.Group buttonStyle="solid" disabled={!!freigabe} optionType="button" options={statusse} />
            </Form.Item>
          </ConfigProvider>
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          {status === "abgerechnet" && (
            <TextField label="Rechnungsnummer" name={["angebot", "rechnungsnummer"]} required={status === "abgerechnet"} />
          )}
        </Col>
      </JazzRow>
      {isDirty ? <b>Vor dem generieren musst Du speichern!</b> : null}
      <JazzRow>
        <Col span={6}>
          <SingleSelect label="Art" name="art" options={printOptions} />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending="id"
            renderWidget={(getFieldValue) => {
              return (
                <Form.Item label="&nbsp;">
                  <Button
                    block
                    disabled={isDirty || !getFieldValue("id")}
                    onClick={() => openAngebotRechnung(new Vermietung(form.getFieldsValue(true)))}
                    type="primary"
                  >
                    Generieren
                  </Button>
                </Form.Item>
              );
            }}
          />
        </Col>
        <Col span={10}>
          {vergangen ? (
            !freigabe ? (
              <Form.Item label="&nbsp;">
                <ButtonWithIcon
                  block
                  disabled={status !== "abgerechnet" || isDirty || !darfFreigeben}
                  icon="Unlock"
                  onClick={freigeben}
                  text="Rechnung freigeben..."
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item label="&nbsp;">
                  <ButtonWithIcon
                    block
                    color="#c71c2c"
                    disabled={isDirty || !darfFreigabeAufheben}
                    icon="Lock"
                    onClick={freigabeAufheben}
                    text="Ist freigegeben"
                    type="primary"
                  />
                </Form.Item>
                <TextField disabled label="Durch" name={["angebot", "freigabe"]} />
              </>
            )
          ) : null}
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
