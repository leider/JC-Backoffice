import { Modal } from "antd";
import { TextField } from "@/widgets/TextField.tsx";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

export function ShowOnCopy({ title, isNew, startDate }: { title: string; isNew: boolean; startDate?: Date }) {
  const { url } = useParams();
  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setOpenCopyModal(!done && isNew && !!startDate && !!url?.includes("copy-of"));
  }, [isNew, url, startDate, done]);

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
