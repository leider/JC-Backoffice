import { Modal } from "antd";
import { TextField } from "@/widgets/TextField.tsx";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { FormContext } from "antd/es/form/context";
import { useWatch } from "antd/es/form/Form";

export function ShowOnCopy({ title }: { title: string }) {
  const { url } = useParams();
  const { form } = useContext(FormContext);
  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [done, setDone] = useState(false);

  const id = useWatch("id", { form, preserve: true });
  const startDate = useWatch("startDate", { form, preserve: true });

  useEffect(() => {
    setOpenCopyModal(!done && !id && !!startDate && !!url?.includes("copy-of"));
  }, [id, url, startDate, done]);

  return (
    <Modal
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
    </Modal>
  );
}
