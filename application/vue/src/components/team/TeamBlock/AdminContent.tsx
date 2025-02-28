import Konzert from "jc-shared/konzert/konzert.ts";
import { Col, Collapse, ConfigProvider, Form, Row, Typography } from "antd";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { saveKonzert, saveVermietung } from "@/commons/loader.ts";
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

interface ContentProps {
  veranstaltung: Veranstaltung;
}

export default function AdminContent({ veranstaltung: veranVermiet }: ContentProps) {
  const [form] = Form.useForm();
  const { isCompactMode, isDarkMode, brightText } = useJazzContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialValue, setInitialValue] = useState<any>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(veranVermiet);
  const [showMitarbeiter, setShowMitarbeiter] = useState<boolean>(false);

  const { usersAsOptions } = useContext(TeamContext);

  const forVermietung = useMemo(() => {
    return veranstaltung.isVermietung;
  }, [veranstaltung]);

  const setFormValue = useCallback(() => {
    const deepCopy = veranstaltung.toJSON();
    form.resetFields();
    form.setFieldsValue(deepCopy);
    setInitialValue(veranstaltung.toJSON());
    setDirty(false);
  }, [form, veranstaltung]);

  useEffect(setFormValue, [setFormValue]);

  useEffect(() => {
    setVeranstaltung(veranVermiet);
  }, [veranVermiet]);

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

  function saveForm() {
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
  }

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
        Select: { colorIcon: labelColor, colorText: labelColor, colorTextPlaceholder: labelColor, selectorBg: backgroundColor },
        Tag: { defaultColor: labelColor },
      },
    }),
    [backgroundColor, labelColor],
  );
  const { inView, ref } = useInView({ triggerOnce: true });

  return (
    <div ref={ref} style={{ margin: isCompactMode ? -8 : -12, backgroundColor: backgroundColor, borderColor: backgroundColor }}>
      <Row>
        <Col span={6}>
          <Typography.Title
            level={5}
            style={{ marginLeft: 8, marginBlockStart: 4, marginBlockEnd: 0 }}
            onClick={() => {
              setShowMitarbeiter(!showMitarbeiter);
            }}
          >
            <span style={{ color: labelColor }}>
              <IconForSmallBlock iconName="UniversalAccess" color={labelColor} />
              &nbsp;...
            </span>
          </Typography.Title>
        </Col>
        <Col span={18}>
          {inView && (
            <Row justify="end" style={{ paddingTop: 2, paddingRight: 4 }}>
              {showMitarbeiter && dirty ? (
                <>
                  <ConfigProvider theme={{ token: { colorBgBase: brightText } }}>
                    <ResetButton size="small" disabled={!dirty} resetChanges={setFormValue} />
                    <SaveButton size="small" disabled={!dirty} callback={() => form.submit()} />
                  </ConfigProvider>
                </>
              ) : (
                <>
                  <ButtonInAdminPanel type="allgemeines" veranstaltung={veranstaltung} />
                  <ButtonInAdminPanel type={forVermietung ? "angebot" : "gaeste"} veranstaltung={veranstaltung} />
                  {(!forVermietung || (veranstaltung as Vermietung).brauchtTechnik) && (
                    <ButtonInAdminPanel type="technik" veranstaltung={veranstaltung} />
                  )}
                  <ButtonInAdminPanel type="ausgaben" veranstaltung={veranstaltung} />
                  {veranstaltung.artist.brauchtHotel && <ButtonInAdminPanel type="hotel" veranstaltung={veranstaltung} />}
                  {!forVermietung && <ButtonInAdminPanel type="kasse" veranstaltung={veranstaltung} />}
                  {veranstaltung.brauchtPresse && <ButtonInAdminPanel type="presse" veranstaltung={veranstaltung} />}
                  <ButtonPreview veranstaltung={veranstaltung} />
                </>
              )}
            </Row>
          )}
        </Col>
      </Row>
      {inView && (
        <ConfigProvider theme={staffRowsTheme}>
          <Collapse
            ghost
            activeKey={showMitarbeiter ? "mitarbeiter" : ""}
            items={[
              {
                showArrow: false,
                key: "mitarbeiter",
                children: (
                  <Form
                    form={form}
                    onValuesChange={() => {
                      setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
                    }}
                    onFinish={saveForm}
                    layout="vertical"
                    size="small"
                  >
                    <div style={{ padding: 8, margin: -8, marginTop: -12 }}>
                      <EditableStaffRows forVermietung={forVermietung} usersAsOptions={usersAsOptions} brauchtTechnik={brauchtTechnik} />
                    </div>
                  </Form>
                ),
              },
            ]}
          />
        </ConfigProvider>
      )}
    </div>
  );
}
