import { TextField } from "@/widgets/TextField.tsx";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzModal } from "@/widgets/JazzModal.tsx";

export function ShowOnCopy({ title }: { title: string }) {
  const { url } = useParams();
  const form = useFormInstance();
  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [done, setDone] = useState(false);

  const id = useWatch("id", { form, preserve: true });
  const startDate = useWatch("startDate", { form, preserve: true });

  useEffect(() => {
    setOpenCopyModal(!done && !id && !!startDate && !!url?.includes("copy-of"));
  }, [id, url, startDate, done]);

  return (
    <JazzModal
      title={title}
      open={openCopyModal}
      onOk={() => {
        setOpenCopyModal(false);
        setDone(true);
      }}
      okText="Weiter"
      closable={false}
      footer={(_, { OkBtn }) => <OkBtn />}
    >
      <p>Du möchtest sicher Titel und Datum anpassen.</p>
      <TextField name={["kopf", "titel"]} label="Titel" required />
      <StartEndPickers />
    </JazzModal>
  );
}
