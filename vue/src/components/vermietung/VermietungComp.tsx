import * as React from "react";
import { createContext, useEffect, useState } from "react";
import { App, Form, FormInstance } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saveVermietung, vermietungForUrl } from "@/commons/loader.ts";
import { areDifferent } from "@/commons/comparingAndTransforming";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import VermietungPageHeader from "@/components/vermietung/VermietungPageHeader.tsx";
import { fromFormObject, toFormObject } from "@/components/vermietung/vermietungCompUtils.ts";
import VermietungTabs from "@/components/vermietung/VermietungTabs.tsx";
import OptionValues from "jc-shared/optionen/optionValues.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export const VermietungContext = createContext<{ form: FormInstance<Vermietung>; optionen: OptionValues } | null>(null);

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

  const queryClient = useQueryClient();

  const { notification } = App.useApp();

  // When this mutation succeeds, invalidate any queries with the `todos` or `reminders` query key
  const mutateVermietung = useMutation({
    mutationFn: (vermiet: Vermietung) => {
      setDirty(false);
      return saveVermietung(vermiet);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vermietung"] });
      navigate(
        {
          pathname: `/vermietung/${data.url}`,
          search: `page=${search.get("page")}`,
        },
        { replace: true },
      );
      showSuccess({ text: "Die Vermietung wurde gespeichert" });
    },
  });

  const [form] = Form.useForm<Vermietung>();

  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty, true);

  const { currentUser, optionen, showSuccess } = useJazzContext();
  const navigate = useNavigate();
  useEffect(() => {
    const deepCopy = toFormObject(vermietung);
    form.setFieldsValue(deepCopy);
    const initial = toFormObject(vermietung);
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    setIsNew(!vermietung.id);
    form.validateFields();
  }, [form, vermietung]);
  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && !accessrights.isOrgaTeam) {
      navigate(`/team`);
    }
  }, [currentUser, navigate, url]);

  const [isNew, setIsNew] = useState<boolean>(false);

  const [search] = useSearchParams();
  function saveForm() {
    form.validateFields().then(async () => {
      const vermiet = fromFormObject(form);

      if (isNew) {
        vermiet.initializeIdAndUrl();
      }
      mutateVermietung.mutate(vermiet);
    });
  }

  return (
    <VermietungContext.Provider value={{ form, optionen }}>
      <Form
        form={form}
        onValuesChange={() => {
          // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
          // console.log({ diff });
          // console.log({ initialValue });
          // console.log({ form: form.getFieldsValue(true) });
          setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
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
