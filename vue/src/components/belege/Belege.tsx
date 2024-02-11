import { uploadBeleg } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, DatePicker, Form, Row, Space, Upload, UploadFile, UploadProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import TextArea from "antd/es/input/TextArea";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { RcFile } from "antd/es/upload";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";

export default function Belege() {
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);

  const [form] = Form.useForm<{ datum: Dayjs; kommentar: string | null }>();

  document.title = "Beleg Hochladen";

  function initializeForm() {
    document.title = "Manuelle Nachricht";
    form.setFieldsValue({
      datum: dayjs(),
      kommentar: null,
    });
    form.validateFields();
    setFileList([]);
    setUploading(false);
    setDirty(false);
  }
  useEffect(initializeForm, [form]);

  function send() {
    form.validateFields().then(async () => {
      setUploading(true);
      const mail = form.getFieldsValue(true);

      const formData = new FormData();
      const file = fileList[0] as RcFile;
      formData.append("datei", file, file.name);
      formData.append("datum", new DatumUhrzeit(mail.datum).tagMonatJahrLang);
      formData.append("kommentar", mail.kommentar);
      await uploadBeleg(formData);
      initializeForm();
    });
  }

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadprops: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  useEffect(
    valuesChanged, // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileList],
  );

  function valuesChanged() {
    form
      .validateFields()
      .then((value) => setDirty(!!value.kommentar && fileList.length > 0))
      .catch((value) => setDirty(value.errorFields.length === 0 && !!value.komentar && value.fileList.length > 0));
  }

  return (
    <Form form={form} onValuesChange={valuesChanged} onFinish={send} layout="vertical">
      <JazzPageHeader
        title={<span style={{ whiteSpace: "normal" }}>Beleg Hochladen</span>}
        firstTag={<span style={{ whiteSpace: "normal" }}>Einen Beleg direkt an die Buchhaltung schicken</span>}
        buttons={[
          <ButtonWithIcon
            text={uploading ? "Lädt..." : "Hochladen"}
            key="sendBeleg"
            onClick="submit"
            icon="Upload"
            disabled={!dirty}
            loading={uploading}
          />,
        ]}
      >
        <div>
          <p>Denk daran, uns den Beleg noch im Original zukommen zu lassen.</p>
          <p>Entweder...</p>
          <ul>
            <li>... gibst Du ihn direkt an der Abendkasse ab, oder</li>
            <li>... Du schickst Ihn an die Büroadresse</li>
          </ul>
        </div>
      </JazzPageHeader>
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <Space>
              <Form.Item label={<b>Datum des Belegs:</b>} initialValue={dayjs()} name="datum">
                <DatePicker allowClear={false} format={"ddd DD.MM.YYYY"} />
              </Form.Item>
              <Upload {...uploadprops}>
                <ButtonWithIcon icon="FileEarmarkPlus" text="Auswählen" />
              </Upload>
            </Space>
          </Col>
          <Col span={24}>
            <Form.Item label={<b>Kommentar:</b>} name="kommentar" required>
              <TextArea rows={10} />
            </Form.Item>
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
