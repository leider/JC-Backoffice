import * as React from "react";
import { useEffect, useState } from "react";
import { Form } from "antd";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { optionen as optionenRestCall, orte as orteRestCall, saveVeranstaltung, veranstaltungForUrl } from "@/commons/loader-for-react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { areDifferent } from "@/commons/comparingAndTransforming";
import OptionValues from "jc-shared/optionen/optionValues";
import { fromFormObject, toFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import Orte from "jc-shared/optionen/orte";
//import { detailedDiff } from "deep-object-diff";
import VeranstaltungTabs from "@/components/veranstaltung/VeranstaltungTabs";
import VeranstaltungPageHeader from "@/components/veranstaltung/VeranstaltungPageHeader";

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

  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);

  function initializeForm() {
    const deepCopy = toFormObject(veranstaltung);
    form.setFieldsValue(deepCopy);
    const initial = toFormObject(veranstaltung);
    setInitialValue(initial);
    updateStateStuff();
    setDirty(areDifferent(initial, deepCopy));
    setIsNew(!veranstaltung.id);
    form.validateFields();
  }

  useEffect(initializeForm, [form, veranstaltung]);

  const [isNew, setIsNew] = useState<boolean>(false);

  function updateStateStuff() {
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
      <VeranstaltungPageHeader isNew={isNew} dirty={dirty} form={form} />
      <VeranstaltungTabs veranstaltung={veranstaltung} optionen={optionen} orte={orte} form={form} />
    </Form>
  );
}
