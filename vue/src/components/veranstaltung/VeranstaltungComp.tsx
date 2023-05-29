import * as React from "react";
import { useEffect, useState } from "react";
import { App, Form, Tag, theme } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  deleteVeranstaltungWithId,
  optionen as optionenRestCall,
  orte as orteRestCall,
  saveVeranstaltung,
  veranstaltungForUrl,
} from "@/commons/loader-for-react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import { areDifferent } from "@/commons/comparingAndTransforming";
import OptionValues from "jc-shared/optionen/optionValues";
import { fromFormObject, toFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import Orte from "jc-shared/optionen/orte";
//import { detailedDiff } from "deep-object-diff";
import { CopyButton, DeleteButton, SaveButton } from "@/components/colored/JazzButtons";
import { PageHeader } from "@ant-design/pro-layout";
import VeranstaltungTabs from "@/components/veranstaltung/VeranstaltungTabs";

export default function VeranstaltungComp() {
  const { url } = useParams();
  const veranst = useQuery({ queryKey: ["veranstaltung", url], queryFn: () => veranstaltungForUrl(url || "") });
  const opts = useQuery({ queryKey: ["optionen"], queryFn: optionenRestCall });
  const locations = useQuery({ queryKey: ["orte"], queryFn: orteRestCall });

  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung());
  const [optionen, setOptionen] = useState<OptionValues>(new OptionValues());
  const [orte, setOrte] = useState<Orte>(new Orte());

  useEffect(() => {
    if (veranst.data) {
      setVeranstaltung(veranst.data);
    }
  }, [veranst.data]);

  useEffect(() => {
    if (opts.data) {
      setOptionen(opts.data);
    }
  }, [opts.data]);

  useEffect(() => {
    if (locations.data) {
      setOrte(locations.data);
    }
  }, [locations.data]);

  const [form] = Form.useForm<Veranstaltung>();

  const { useToken } = theme;
  const { token } = useToken();
  const [typeColor, setTypeColor] = useState<string>("");
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);

  function initializeForm() {
    const deepCopy = toFormObject(veranstaltung);
    form.setFieldsValue(deepCopy);
    const initial = toFormObject(veranstaltung);
    setInitialValue(initial);
    updateStateStuff();
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }

  useEffect(initializeForm, [form, veranstaltung]);

  const [displayDate, setDisplayDate] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  function updateStateStuff() {
    const veranstaltung = fromFormObject(form);
    const localIsNew = !veranstaltung.id;

    document.title = localIsNew ? "Neue oder kopierte Veranstaltung" : veranstaltung.kopf.titel;
    setDisplayDate(veranstaltung.datumForDisplayShort);
    setIsNew(localIsNew);
    const confirmed = veranstaltung.kopf.confirmed;
    setIsConfirmed(confirmed);
    const selectedOrt = orte.orte.find((o) => o.name === veranstaltung.kopf.ort);
    if (selectedOrt) {
      form.setFieldsValue({
        kopf: {
          pressename: selectedOrt.pressename || veranstaltung.kopf.ort,
          presseIn: selectedOrt.presseIn || selectedOrt.pressename,
          flaeche: selectedOrt.flaeche,
        },
      });
    }
    const code = `custom-color-${fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp)}`;
    setTypeColor((token as any)[code]);

    const tags = [];
    if (!confirmed) {
      tags.push(
        <Tag key="unbestaetigt" color={"error"}>
          Unbestätigt
        </Tag>
      );
    } else {
      tags.push(
        <Tag key="bestaetigt" color={"success"}>
          Bestätigt
        </Tag>
      );
    }
    if (veranstaltung.kopf.abgesagt) {
      tags.push(
        <Tag key="abgesagt" color={"error"}>
          ABGESAGT
        </Tag>
      );
    }
    setTagsForTitle(tags);

    form.validateFields();
  }

  function saveForm() {
    form.validateFields().then(() => {
      const veranst = fromFormObject(form);
      saveVeranstaltung(veranst);
      setVeranstaltung(veranst);
      initializeForm();
    });
  }

  const navigate = useNavigate();
  const [tagsForTitle, setTagsForTitle] = useState<[]>([]);

  function copyVeranstaltung() {
    const url = form.getFieldValue("url");
    if (!url) {
      return;
    }
    navigate(`/veranstaltung/copy-of-${url}`);
  }

  return (
    <Form
      form={form}
      onValuesChange={() => {
        // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
        // console.log({ diff });
        // console.log({ initialValue });
        // console.log({ form: form.getFieldsValue(true) });
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <PageHeader
        title={<span style={{ color: typeColor }}>{document.title}</span>}
        subTitle={<span style={{ color: typeColor }}>{displayDate}</span>}
        extra={[
          <DeleteButton key="delete" disabled={isNew || isConfirmed} />,
          <CopyButton key="copy" disabled={isNew} callback={copyVeranstaltung} />,
          <SaveButton key="save" disabled={!dirty} callback={saveForm} />,
        ]}
        tags={tagsForTitle}
      >
        {isNew && <b style={{ color: token["custom-color-ausgaben"] }}> (Denk daran, alle Felder zu überprüfen und auszufüllen)</b>}
      </PageHeader>
      <VeranstaltungTabs veranstaltung={veranstaltung} optionen={optionen} orte={orte} form={form} updateStateStuff={updateStateStuff} />
    </Form>
  );
}
