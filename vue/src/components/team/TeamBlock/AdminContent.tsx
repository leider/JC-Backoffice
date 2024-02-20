import Konzert, { ChangelistItem } from "../../../../../shared/konzert/konzert.ts";
import { Col, Collapse, Form, Row } from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveKonzert, saveVermietung } from "@/commons/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { areDifferent, differenceFor } from "@/commons/comparingAndTransforming.ts";
import { SaveButton } from "@/components/colored/JazzButtons.tsx";
import EditableStaffRows from "@/components/team/TeamBlock/EditableStaffRows.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { ButtonInAdminPanel } from "@/components/team/TeamBlock/ButtonInAdminPanel.tsx";
import { ButtonPreview } from "@/components/team/TeamBlock/ButtonPreview.tsx";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

interface ContentProps {
  veranstaltung: Veranstaltung;
}

export default function AdminContent({ veranstaltung: veranVermiet }: ContentProps) {
  const [form] = Form.useForm();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialValue, setInitialValue] = useState<any>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Konzert());
  const { currentUser, showSuccess } = useJazzContext();
  const [showMitarbeiter, setShowMitarbeiter] = useState<boolean>(false);

  const { usersAsOptions } = useContext(TeamContext);

  const forVermietung = useMemo(() => {
    return veranstaltung.isVermietung;
  }, [veranstaltung]);

  useEffect(
    () => {
      const deepCopy = veranstaltung.toJSON();
      form.resetFields();
      form.setFieldsValue(deepCopy);
      setInitialValue(veranstaltung.toJSON());
      setDirty(false);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [veranstaltung],
  );

  useEffect(() => {
    setVeranstaltung(veranVermiet);
  }, [veranVermiet]);

  const queryClient = useQueryClient();

  const brauchtTechnik = useMemo(() => (veranstaltung as Vermietung).brauchtTechnik, [veranstaltung]);

  const mutateVeranstaltung = useMutation({
    mutationFn: saveKonzert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung"] });
      showSuccess({ text: "Die Veranstaltung wurde gespeichert" });
    },
  });

  const mutateVermietung = useMutation({
    mutationFn: saveVermietung,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vermietung"] });
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
        const diff = differenceFor(initialValue, veranst, ["agenturauswahl", "hotelauswahl", "endbestandEUR"]);
        veranst.changelist.unshift(createLogWithDiff(diff));
        result = new Konzert(veranst);
        mutateVeranstaltung.mutate(result);
      }
      setVeranstaltung(result);
    });
  }

  const color = useMemo(
    () => (veranstaltung.isVermietung ? "#f6eee1" : veranstaltung.kopf.eventTypRich?.color || "#6c757d"),
    [veranstaltung],
  );

  const textColor = useMemo(() => (veranstaltung.isVermietung ? "black" : "white"), [veranstaltung.isVermietung]);

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
                <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="allgemeines" isVermietung={forVermietung} />
                {!forVermietung && <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="gaeste" isVermietung={forVermietung} />}
                {forVermietung && <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="angebot" isVermietung={forVermietung} />}
                {(!forVermietung || (veranstaltung as Vermietung).brauchtTechnik) && (
                  <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="technik" isVermietung={forVermietung} />
                )}
                <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="ausgaben" isVermietung={forVermietung} />
                {veranstaltung.artist.brauchtHotel && <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="hotel" />}
                {!forVermietung && <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="kasse" />}
                {(!forVermietung || (veranstaltung as Vermietung).brauchtPresse) && (
                  <ButtonInAdminPanel url={veranstaltung.url ?? ""} type="presse" isVermietung={forVermietung} />
                )}
                <ButtonPreview veranstaltung={veranstaltung} />
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
