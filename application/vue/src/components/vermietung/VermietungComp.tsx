import * as React from "react";
import { createContext, useCallback, useEffect, useState } from "react";
import { App, Form, FormInstance } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { saveVermietung, vermietungForUrl } from "@/commons/loader.ts";
import { areDifferent } from "@/commons/comparingAndTransforming";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import VermietungPageHeader from "@/components/vermietung/VermietungPageHeader.tsx";
import VermietungTabs from "@/components/vermietung/VermietungTabs.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { useWatch } from "antd/es/form/Form";

export const VermietungContext = createContext<{ form: FormInstance<Vermietung>; isDirty: boolean } | null>(null);

export default function VermietungComp() {
  const { url } = useParams();

  const vermiet = useQuery({
    queryKey: ["vermietung", url],
    queryFn: () => vermietungForUrl(url || ""),
  });

  const [vermietung, setVermietung] = useState<Vermietung>(new Vermietung({ id: "unknown" }));

  useEffect(() => {
    if (vermiet.data) {
      setVermietung(vermiet.data);
    }
  }, [vermiet.data]);

  const { notification } = App.useApp();
  const [dirty, setDirty] = useState<boolean>(false);

  const mutateVermietung = useJazzMutation<Vermietung>({
    saveFunction: saveVermietung,
    queryKey: "vermietung",
    successMessage: "Die Vermietung wurde gespeichert",
    setDirty,
    setResult: setVermietung,
  });

  const [form] = Form.useForm<Vermietung>();

  const [initialValue, setInitialValue] = useState<object>({});

  const updateDirtyIfChanged = useCallback((initial: object, current: object) => {
    setDirty(areDifferent(initial, current));
  }, []);
  useDirtyBlocker(dirty);

  const { currentUser } = useJazzContext();
  const navigate = useNavigate();

  const freigabe = useWatch(["angebot", "freigabe"], { form, preserve: true });

  useEffect(() => {
    updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
  }, [freigabe, form, initialValue, updateDirtyIfChanged]);

  useEffect(() => {
    const deepCopy = vermietung.toJSON();
    form.setFieldsValue(deepCopy);
    const initial = vermietung.toJSON();
    setInitialValue(initial);
    updateDirtyIfChanged(initial, deepCopy);
    setIsNew(!vermietung.id);
    form.validateFields();
  }, [form, updateDirtyIfChanged, vermietung]);

  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && !accessrights.isOrgaTeam) {
      navigate(`/team`);
    }
  }, [currentUser, navigate, url]);

  const [isNew, setIsNew] = useState<boolean>(false);

  function saveForm() {
    form.validateFields().then(async () => {
      const vermiet = new Vermietung(form.getFieldsValue(true));

      if (isNew) {
        vermiet.initializeIdAndUrl();
      }
      mutateVermietung.mutate(vermiet);
    });
  }

  return (
    <VermietungContext.Provider value={{ form, isDirty: dirty }}>
      <Form
        form={form}
        onValuesChange={() => {
          // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
          // console.log({ diff });
          // console.log({ initialValue });
          // console.log({ form: form.getFieldsValue(true) });
          updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
        }}
        onFinishFailed={() => {
          notification.error({
            type: "error",
            message: "Fehler",
            description: "Es gibt noch fehlerhafte Felder. Bitte prüfe alle Tabs",
            duration: 5,
          });
        }}
        onFinish={saveForm}
        layout="vertical"
      >
        <VermietungPageHeader isNew={isNew} dirty={dirty} />
        <VermietungTabs />
      </Form>
    </VermietungContext.Provider>
  );
}
