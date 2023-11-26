import Veranstaltung, { ChangelistItem } from "jc-shared/veranstaltung/veranstaltung.ts";
import { Col, Collapse, Divider, Form, notification, Row } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/commons/authConsts.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveVeranstaltung, saveVermietung } from "@/commons/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { differenceFor } from "jc-shared/commons/compareObjects.ts";
import { areDifferent } from "@/commons/comparingAndTransforming.ts";
import { SaveButton } from "@/components/colored/JazzButtons.tsx";
import { ButtonInAdminPanel, ButtonPreview } from "@/components/Buttons.tsx";
import AdminStaffRow from "@/components/team/TeamBlock/AdminStaffRow.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { IconForSmallBlock } from "@/components/Icon.tsx";

interface ContentProps {
  veranstaltungOderVermietung: Veranstaltung | Vermietung;
}

export default function AdminContent({ veranstaltungOderVermietung: veranVermiet }: ContentProps) {
  const [form] = Form.useForm();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialValue, setInitialValue] = useState<any>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const [veranstaltungOderVermietung, setVeranstaltungOderVermietung] = useState<Veranstaltung | Vermietung>(new Veranstaltung());
  const { context } = useAuth();
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
        <Col span={6}>
          <h3
            style={{ marginLeft: 8, marginBlockStart: 4, marginBlockEnd: 0 }}
            onClick={() => {
              setShowMitarbeiter(!showMitarbeiter);
            }}
          >
            <span>
              <IconForSmallBlock iconName="UniversalAccess" />
              &nbsp;...
            </span>
          </h3>
        </Col>
        <Col span={18}>
          <Row justify="end">
            {showMitarbeiter ? (
              <SaveButton disabled={!dirty} />
            ) : (
              <>
                <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="allgemeines" isVermietung={isVermietung()} />
                {(!isVermietung() || (veranstaltungOderVermietung as Vermietung).brauchtTechnik) && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="technik" isVermietung={isVermietung()} />
                )}
                {isVermietung() && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="angebot" isVermietung={isVermietung()} />
                )}
                <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="ausgaben" isVermietung={isVermietung()} />
                {veranstaltungOderVermietung.artist.brauchtHotel && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="hotel" />
                )}
                {!isVermietung() && <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="kasse" />}
                {(!isVermietung() || (veranstaltungOderVermietung as Vermietung).brauchtPresse) && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="presse" isVermietung={isVermietung()} />
                )}
                {!isVermietung() && <ButtonPreview veranstaltung={veranstaltungOderVermietung as Veranstaltung} />}
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
                    <AdminStaffRow label="Ton:" sectionName="technikerV" />
                    <AdminStaffRow label="Licht:" sectionName="techniker" />
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
