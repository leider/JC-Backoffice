import Veranstaltung, { ChangelistItem } from "jc-shared/veranstaltung/veranstaltung.ts";
import { Col, Collapse, Form, Row } from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveVeranstaltung, saveVermietung } from "@/commons/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { differenceFor } from "jc-shared/commons/compareObjects.ts";
import { areDifferent } from "@/commons/comparingAndTransforming.ts";
import { SaveButton } from "@/components/colored/JazzButtons.tsx";
import EditableStaffRows from "@/components/team/TeamBlock/EditableStaffRows.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { ButtonInAdminPanel } from "@/components/team/TeamBlock/ButtonInAdminPanel.tsx";
import { ButtonPreview } from "@/components/team/TeamBlock/ButtonPreview.tsx";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

interface ContentProps {
  veranstaltungOderVermietung: Veranstaltung | Vermietung;
}

export default function AdminContent({ veranstaltungOderVermietung: veranVermiet }: ContentProps) {
  const [form] = Form.useForm();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialValue, setInitialValue] = useState<any>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const [veranstaltungOderVermietung, setVeranstaltungOderVermietung] = useState<Veranstaltung | Vermietung>(new Veranstaltung());
  const { currentUser, showSuccess } = useJazzContext();
  const [showMitarbeiter, setShowMitarbeiter] = useState<boolean>(false);

  const teamContext = useContext(TeamContext);
  const usersAsOptions = teamContext.usersAsOptions;

  const forVermietung = useMemo(() => {
    return veranstaltungOderVermietung.isVermietung;
  }, [veranstaltungOderVermietung]);

  useEffect(
    () => {
      const deepCopy = veranstaltungOderVermietung.toJSON();
      form.resetFields();
      form.setFieldsValue(deepCopy);
      setInitialValue(veranstaltungOderVermietung.toJSON());
      setDirty(false);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [veranstaltungOderVermietung],
  );

  useEffect(() => {
    setVeranstaltungOderVermietung(veranVermiet);
  }, [veranVermiet]);

  const queryClient = useQueryClient();

  const brauchtTechnik = useMemo(() => (veranstaltungOderVermietung as Vermietung).brauchtTechnik, [veranstaltungOderVermietung]);

  const mutateVeranstaltung = useMutation({
    mutationFn: saveVeranstaltung,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["veranstaltung"],
      });
      showSuccess({ text: "Die Veranstaltung wurde gespeichert" });
    },
  });

  const mutateVermietung = useMutation({
    mutationFn: saveVermietung,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vermietung"],
      });
      showSuccess({ text: "Die VerMietung wurde gespeichert" });
    },
  });

  function saveForm() {
    const createLogWithDiff = (diff: string): ChangelistItem => ({
      zeitpunkt: new DatumUhrzeit().mitUhrzeitNumerisch,
      bearbeiter: currentUser.id || "",
      diff,
    });
    form.validateFields().then(async () => {
      const veranst = form.getFieldsValue(true);
      let result;
      if (forVermietung) {
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

  const color = useMemo(
    () => (veranstaltungOderVermietung.isVermietung ? "#f6eee1" : veranstaltungOderVermietung.kopf.eventTypRich?.color || "#6c757d"),
    [veranstaltungOderVermietung],
  );

  const textColor = useMemo(
    () => (veranstaltungOderVermietung.isVermietung ? "black" : "white"),
    [veranstaltungOderVermietung.isVermietung],
  );

  return (
    <Form
      form={form}
      onValuesChange={() => {
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      layout="vertical"
      size="small"
      style={{ margin: -12, backgroundColor: color, borderColor: color }}
    >
      <Row>
        <Col span={6}>
          <h3
            style={{ marginLeft: 8, marginBlockStart: 4, marginBlockEnd: 0 }}
            onClick={() => {
              setShowMitarbeiter(!showMitarbeiter);
            }}
          >
            <span style={{ color: textColor }}>
              <IconForSmallBlock iconName="UniversalAccess" color={textColor} />
              &nbsp;...
            </span>
          </h3>
        </Col>
        <Col span={18}>
          <Row justify="end" style={{ paddingTop: 2, paddingRight: 4 }}>
            {showMitarbeiter && dirty ? (
              <SaveButton disabled={!dirty} />
            ) : (
              <>
                <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="allgemeines" isVermietung={forVermietung} />
                {!forVermietung && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="gaeste" isVermietung={forVermietung} />
                )}
                {forVermietung && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="angebot" isVermietung={forVermietung} />
                )}
                {(!forVermietung || (veranstaltungOderVermietung as Vermietung).brauchtTechnik) && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="technik" isVermietung={forVermietung} />
                )}
                <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="ausgaben" isVermietung={forVermietung} />
                {veranstaltungOderVermietung.artist.brauchtHotel && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="hotel" />
                )}
                {!forVermietung && <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="kasse" />}
                {(!forVermietung || (veranstaltungOderVermietung as Vermietung).brauchtPresse) && (
                  <ButtonInAdminPanel url={veranstaltungOderVermietung.url ?? ""} type="presse" isVermietung={forVermietung} />
                )}
                {!forVermietung && <ButtonPreview veranstaltung={veranstaltungOderVermietung as Veranstaltung} />}
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
              <div style={{ padding: 8, margin: -8, marginTop: -12, backgroundColor: "white", borderColor: "white" }}>
                <EditableStaffRows forVermietung={forVermietung} usersAsOptions={usersAsOptions} brauchtTechnik={brauchtTechnik} />
              </div>
            ),
          },
        ]}
      />
    </Form>
  );
}
