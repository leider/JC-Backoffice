import { TextField } from "@/widgets/TextField.tsx";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzModal } from "@/widgets/JazzModal.tsx";

function footer(_: unknown, { OkBtn }: { OkBtn: React.FC }) {
  return <OkBtn />;
}

export function ShowOnCopy({ title }: { readonly title: string }) {
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
      closable={false}
      footer={footer}
      okText="Weiter"
      onOk={() => {
        setOpenCopyModal(false);
        setDone(true);
      }}
      open={openCopyModal}
      title={title}
    >
      <p>Du möchtest sicher Titel und Datum anpassen.</p>
      <TextField label="Titel" name={["kopf", "titel"]} required />
      <StartEndPickers />
    </JazzModal>
  );
}
