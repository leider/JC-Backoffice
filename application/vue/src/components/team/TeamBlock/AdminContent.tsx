import Konzert from "jc-shared/konzert/konzert.ts";
import { Col, Collapse, ConfigProvider, Form, Row, Typography } from "antd";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { saveKonzert, saveVermietung } from "@/rest/loader.ts";
import { areDifferent } from "@/commons/comparingAndTransforming.ts";
import { ResetButton, SaveButton } from "@/components/colored/JazzButtons.tsx";
import EditableStaffRows from "@/components/team/TeamBlock/EditableStaffRows.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { ButtonInAdminPanel } from "@/components/team/TeamBlock/ButtonInAdminPanel.tsx";
import { ButtonPreview } from "@/components/team/TeamBlock/ButtonPreview.tsx";
import { TeamContext } from "@/components/team/TeamContext.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useInView } from "react-intersection-observer";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import cloneDeep from "lodash/cloneDeep";

type ButtonsProps = {
  readonly dirty: boolean;
  readonly forVermietung: boolean;
  readonly setFormValue: () => void;
  readonly showMitarbeiter: boolean;
  readonly veranstaltung: Veranstaltung;
};

function Buttons({ showMitarbeiter, dirty, setFormValue, veranstaltung, forVermietung }: ButtonsProps) {
  const form = useFormInstance();
  const { brightText } = useJazzContext();
  const save = useCallback(() => form.submit(), [form]);
  return (
    <Row justify="end" style={{ paddingTop: 2, paddingRight: 4 }}>
      {showMitarbeiter && dirty ? (
        <ConfigProvider theme={{ token: { colorBgBase: brightText } }}>
          <ResetButton disabled={!dirty} resetChanges={setFormValue} size="small" />
          <SaveButton callback={save} disabled={!dirty} size="small" />
        </ConfigProvider>
      ) : (
        <>
          <ButtonInAdminPanel type="allgemeines" veranstaltung={veranstaltung} />
          <ButtonInAdminPanel type={forVermietung ? "angebot" : "gaeste"} veranstaltung={veranstaltung} />
          {!forVermietung || (veranstaltung as Vermietung).brauchtTechnik ? (
            <ButtonInAdminPanel type="technik" veranstaltung={veranstaltung} />
          ) : null}
          <ButtonInAdminPanel type="ausgaben" veranstaltung={veranstaltung} />
          {veranstaltung.artist.brauchtHotel ? <ButtonInAdminPanel type="hotel" veranstaltung={veranstaltung} /> : null}
          {!forVermietung && <ButtonInAdminPanel type="kasse" veranstaltung={veranstaltung} />}
          {veranstaltung.brauchtPresse ? <ButtonInAdminPanel type="presse" veranstaltung={veranstaltung} /> : null}
          <ButtonPreview veranstaltung={veranstaltung} />
        </>
      )}
    </Row>
  );
}

export default function AdminContent({ veranstaltung: veranVermiet }: { readonly veranstaltung: Veranstaltung }) {
  const [form] = Form.useForm();
  const { isCompactMode, isDarkMode } = useJazzContext();
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(veranVermiet);
  const [showMitarbeiter, setShowMitarbeiter] = useState<boolean>(false);

  const { usersAsOptions } = useContext(TeamContext);

  const forVermietung = useMemo(() => veranstaltung.isVermietung, [veranstaltung]);

  const setFormValue = useCallback(() => {
    const deepCopy = cloneDeep(veranstaltung);
    form.resetFields();
    form.setFieldsValue(deepCopy);
    setInitialValue(cloneDeep(veranstaltung));
    setDirty(false);
  }, [form, veranstaltung]);

  useEffect(setFormValue, [setFormValue]);

  useEffect(() => setVeranstaltung(veranVermiet), [veranVermiet]);

  const brauchtTechnik = useMemo(() => (veranstaltung as Vermietung).brauchtTechnik, [veranstaltung]);

  const mutateVeranstaltung = useJazzMutation({
    saveFunction: saveKonzert,
    queryKey: "konzert",
    successMessage: "Das Konzert wurde gespeichert",
  });

  const mutateVermietung = useJazzMutation({
    saveFunction: saveVermietung,
    queryKey: "vermietung",
    successMessage: "Die Vermietung wurde gespeichert",
  });

  const saveForm = useCallback(() => {
    form.validateFields().then(async () => {
      const veranst = form.getFieldsValue(true);
      let result;
      if (forVermietung) {
        result = new Vermietung(veranst);
        mutateVermietung.mutate(result);
      } else {
        result = new Konzert(veranst);
        mutateVeranstaltung.mutate(result);
      }
      setVeranstaltung(result);
    });
  }, [form, forVermietung, mutateVermietung, mutateVeranstaltung]);

  const labelColor = useMemo(() => veranstaltung.colorText(isDarkMode), [isDarkMode, veranstaltung]);
  const backgroundColor = useMemo(() => veranstaltung.color, [veranstaltung.color]);
  const staffRowsTheme = useMemo(
    () => ({
      token: { colorBgBase: backgroundColor },
      components: {
        Collapse: {
          contentBg: backgroundColor,
          headerBg: backgroundColor,
        },
        Form: { labelColor },
        Select: {
          colorIcon: labelColor,
          colorText: labelColor,
          colorTextPlaceholder: labelColor,
          selectorBg: backgroundColor,
        },
        Tag: { defaultColor: labelColor },
      },
    }),
    [backgroundColor, labelColor],
  );

  const onValuesChange = useCallback(() => {
    setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
  }, [form, initialValue]);

  const onClick = useCallback(() => {
    setShowMitarbeiter(!showMitarbeiter);
  }, [showMitarbeiter]);

  const { inView, ref } = useInView({ triggerOnce: true });

  return (
    <div ref={ref} style={{ margin: isCompactMode ? -8 : -12, backgroundColor: backgroundColor, borderColor: backgroundColor }}>
      <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
        <Form form={form} layout="vertical" onFinish={saveForm} onValuesChange={onValuesChange} size="small">
          <Row>
            <Col span={6}>
              <Typography.Title level={5} onClick={onClick} style={{ marginLeft: 8, marginBlockStart: 4, marginBlockEnd: 0 }}>
                <span style={{ color: labelColor }}>
                  <IconForSmallBlock color={labelColor} iconName="UniversalAccess" />
                  &nbsp;...
                </span>
              </Typography.Title>
            </Col>
            <Col span={18}>
              {inView ? (
                <Buttons
                  dirty={dirty}
                  forVermietung={forVermietung}
                  setFormValue={setFormValue}
                  showMitarbeiter={showMitarbeiter}
                  veranstaltung={veranstaltung}
                />
              ) : null}
            </Col>
          </Row>
          {inView ? (
            <ConfigProvider theme={staffRowsTheme}>
              <Collapse
                activeKey={showMitarbeiter ? "mitarbeiter" : ""}
                ghost
                items={[
                  {
                    showArrow: false,
                    key: "mitarbeiter",
                    children: (
                      <div style={{ padding: 8, margin: -8, marginTop: -12 }}>
                        <EditableStaffRows brauchtTechnik={brauchtTechnik} forVermietung={forVermietung} usersAsOptions={usersAsOptions} />
                      </div>
                    ),
                  },
                ]}
              />
            </ConfigProvider>
          ) : null}
        </Form>
      </ConfigProvider>
    </div>
  );
}
