import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Form, Modal } from "antd";
import { useNavigate, useParams } from "react-router";
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
import { VermietungContext } from "./VermietungContext";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import { TextField } from "@/widgets/TextField.tsx";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";

export default function VermietungComp() {
  const { url } = useParams();

  const vermietungQueryData = useQuery({
    queryKey: ["vermietung", url],
    queryFn: () => vermietungForUrl(url || ""),
  });

  const [vermietung, setVermietung] = useState<Vermietung>(new Vermietung({ id: "unknown" }));

  useEffect(() => {
    if (vermietungQueryData.data) {
      setVermietung(vermietungQueryData.data);
    }
  }, [vermietungQueryData.data]);

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
    logDiffForDirty(initial, current, false);
    setDirty(areDifferent(initial, current));
  }, []);

  useDirtyBlocker(dirty);

  const { currentUser, showError } = useJazzContext();
  const navigate = useNavigate();

  const freigabe = useWatch(["angebot", "freigabe"], { form, preserve: true });

  const [openCopyModal, setOpenCopyModal] = useState(false);

  useEffect(() => {
    updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
  }, [freigabe, form, initialValue, updateDirtyIfChanged]);

  useEffect(() => {
    const deepCopy = vermietung.toJSON();
    form.setFieldsValue(deepCopy);
    const initial = vermietung.toJSON();
    setInitialValue(initial);
    updateDirtyIfChanged(initial, deepCopy);
    if (!vermietung.id && url?.includes("copy-of") && vermietung.startDate) {
      setOpenCopyModal(true);
    }
    setIsNew(!vermietung.id);
    form.validateFields();
  }, [form, updateDirtyIfChanged, url, vermietung]);

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

  function resetChanges() {
    vermietungQueryData.refetch();
  }

  return (
    <VermietungContext.Provider value={{ form, isDirty: dirty, resetChanges }}>
      <Form
        form={form}
        onValuesChange={() => {
          const current = form.getFieldsValue(true);
          updateDirtyIfChanged(initialValue, current);
        }}
        onFinishFailed={() => {
          showError({ text: "Es gibt noch fehlerhafte Felder. Bitte prüfe alle Tabs" });
        }}
        onFinish={saveForm}
        layout="vertical"
        colon={false}
      >
        <Modal
          title="Kopierte Vermietung"
          open={openCopyModal}
          onOk={() => {
            setOpenCopyModal(false);
          }}
          okText="Weiter"
          closable={false}
          footer={(_, { OkBtn }) => <OkBtn />}
        >
          <p>Du möchtest sicher Titel und Datum anpassen.</p>
          <TextField name={["kopf", "titel"]} label="Titel" required />
          <StartEndPickers />
        </Modal>
        <VermietungPageHeader isNew={isNew} dirty={dirty} />
        <VermietungTabs />
      </Form>
    </VermietungContext.Provider>
  );
}
