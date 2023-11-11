import Veranstaltung, { ChangelistItem } from "jc-shared/veranstaltung/veranstaltung.ts";
import { Button, Col, Collapse, ConfigProvider, Divider, Form, notification, Row, Space, theme, Tooltip } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/commons/auth.tsx";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveVeranstaltung, saveVermietung } from "@/commons/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { differenceFor } from "jc-shared/commons/compareObjects.ts";
import { areDifferent } from "@/commons/comparingAndTransforming.ts";
import { SaveButton } from "@/components/colored/JazzButtons.tsx";
import { ButtonInAdminPanel } from "@/components/Buttons.tsx";
import { IconForSmallBlock } from "@/components/Icon.tsx";
import AdminStaffRow from "@/components/team/TeamBlock/AdminStaffRow.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

interface ContentProps {
  veranstaltungOderVermietung: Veranstaltung | Vermietung;
}

export default function AdminContent({ veranstaltungOderVermietung: veranVermiet }: ContentProps) {
  const [form] = Form.useForm();
  const [initialValue, setInitialValue] = useState<any>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const [veranstaltungOderVermietung, setVeranstaltungOderVermietung] = useState<Veranstaltung | Vermietung>(new Veranstaltung());
  const { context } = useAuth();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [showMitarbeiter, setShowMitarbeiter] = useState<boolean>(false);

  const isVermietung = useCallback(() => {
    return veranstaltungOderVermietung.isVermietung;
  }, [veranstaltungOderVermietung]);

  const initialize = () => {
    const deepCopy = veranstaltungOderVermietung.toJSON();
    form.setFieldsValue(deepCopy);
    setInitialValue(veranstaltungOderVermietung.toJSON());
    setDirty(false);
  };
  useEffect(
    initialize, // eslint-disable-next-line react-hooks/exhaustive-deps
    [veranstaltungOderVermietung],
  );

  useEffect(() => {
    setVeranstaltungOderVermietung(veranVermiet);
  }, [veranVermiet]);

  const dividerStyle = {
    marginTop: "4px",
    marginBottom: "4px",
    fontWeight: 600,
  };

  const queryClient = useQueryClient();

  const mutateVeranstaltung = useMutation({
    mutationFn: saveVeranstaltung,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["veranstaltung", veranstaltungOderVermietung.url],
      });
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Veranstaltung wurde gespeichert",
        duration: 5,
      });
    },
  });

  const mutateVermietung = useMutation({
    mutationFn: saveVermietung,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vermietung", veranstaltungOderVermietung.url],
      });
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Vermietung wurde gespeichert",
        duration: 5,
      });
    },
  });

  function saveForm() {
    const createLogWithDiff = (diff: string): ChangelistItem => ({
      zeitpunkt: new DatumUhrzeit().mitUhrzeitNumerisch,
      bearbeiter: context?.currentUser?.id || "",
      diff,
    });
    form.validateFields().then(async () => {
      const veranst = form.getFieldsValue(true);
      let result;
      if (isVermietung()) {
        result = new Vermietung(veranst);
        mutateVermietung.mutate(result);
      } else {
        const diff = differenceFor(initialValue, veranst);
        veranst.changelist.unshift(createLogWithDiff(diff));
        result = new Veranstaltung(veranst);
        mutateVeranstaltung.mutate(result);
      }
      setVeranstaltungOderVermietung(result);
    });
  }

  return (
    <Form
      form={form}
      onValuesChange={() => {
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      size="small"
      colon={false}
      style={{ margin: -12 }}
    >
      <Row>
        <Col span={8}>
          <h3
            style={{ marginLeft: 8, marginBlockStart: 4, marginBlockEnd: 0 }}
            onClick={() => {
              setShowMitarbeiter(!showMitarbeiter);
            }}
          >
            Mitarbeiter...
          </h3>
        </Col>
        <Col span={16}>
          <Row justify="end">
            {showMitarbeiter ? (
              <SaveButton disabled={!dirty} />
            ) : (
              <>
                <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="allgemeines" isVermietung={isVermietung()} />
                {(!isVermietung() || (veranstaltungOderVermietung as Vermietung).brauchtTechnik) && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="technik" isVermietung={isVermietung()} />
                )}
                <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="ausgaben" isVermietung={isVermietung()} />
                {veranstaltungOderVermietung.artist.brauchtHotel && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="hotel" />
                )}
                {!isVermietung() && <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="kasse" />}
                {(!isVermietung() || (veranstaltungOderVermietung as Vermietung).brauchtPresse) && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="presse" isVermietung={isVermietung()} />
                )}
                {!isVermietung() && (
                  <ConfigProvider theme={{ token: { colorPrimary: (token as any)["custom-color-concert"] } }}>
                    <Tooltip title="Vorschau" color={(token as any)["custom-color-concert"]}>
                      <Button
                        icon={<IconForSmallBlock size={16} iconName={"EyeFill"} />}
                        size="middle"
                        type="primary"
                        onClick={() =>
                          navigate({
                            pathname: `/${"veranstaltung/preview"}/${veranstaltungOderVermietung.url}`,
                          })
                        }
                      />
                    </Tooltip>
                  </ConfigProvider>
                )}
              </>
            )}
          </Row>
        </Col>
      </Row>

      <Collapse
        ghost
        activeKey={showMitarbeiter ? "mitarbeiter" : ""}
        items={[
          {
            showArrow: false,
            key: "mitarbeiter",
            children: (
              <div style={{ padding: 8 }}>
                {!isVermietung() && (
                  <>
                    <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
                      Kasse
                    </Divider>
                    <AdminStaffRow label="Eins:" sectionName="kasseV" />
                    <AdminStaffRow label="Zwei:" sectionName="kasse" />
                  </>
                )}
                {(!isVermietung() || (veranstaltungOderVermietung as Vermietung).brauchtTechnik) && (
                  <>
                    <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
                      Techniker
                    </Divider>
                    <AdminStaffRow label="Eins:" sectionName="technikerV" />
                    <AdminStaffRow label="Zwei:" sectionName="techniker" />
                  </>
                )}
                <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
                  Master
                </Divider>
                <AdminStaffRow label="&nbsp;" sectionName="mod" />
                {!isVermietung() && (
                  <>
                    <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
                      Merchandise
                    </Divider>
                    <AdminStaffRow label="&nbsp;" sectionName="merchandise" />
                  </>
                )}
              </div>
            ),
          },
        ]}
      />
    </Form>
  );
}
