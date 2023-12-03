import { PageHeader } from "@ant-design/pro-layout";
import { uploadBeleg } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, DatePicker, Form, Row, Upload, UploadFile, UploadProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import TextArea from "antd/es/input/TextArea";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { RcFile } from "antd/es/upload";
import ButtonWithIcon from "@/widgets/ButtonWithIcon.tsx";

export default function Belege() {
  const [canSend, setCanSend] = useState<boolean>(false);

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
    setCanSend(false);
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
      .then((value) => setCanSend(!!value.kommentar && fileList.length > 0))
      .catch((value) => setCanSend(value.errorFields.length === 0 && !!value.komentar && value.fileList.length > 0));
  }

  return (
    <Form form={form} onValuesChange={valuesChanged} onFinish={send} layout="vertical">
      <PageHeader
        title={<span style={{ whiteSpace: "normal" }}>Beleg Hochladen</span>}
        subTitle={<span style={{ whiteSpace: "normal" }}>Einen Beleg direkt an die Buchhaltung schicken</span>}
        footer={
          <div>
            <p>Denk daran, uns den Beleg noch im Original zukommen zu lassen.</p>
            <p>Entweder...</p>
            <ul>
              <li>... gibst Du ihn direkt an der Abendkasse ab, oder</li>
              <li>... Du schickst Ihn an die Büroadresse</li>
            </ul>
          </div>
        }
        extra={[
          <ButtonWithIcon
            text={uploading ? "Lädt..." : "Hochladen"}
            key="sendBeleg"
            htmlType="submit"
            icon="Upload"
            type="primary"
            disabled={!canSend}
            loading={uploading}
          />,
        ]}
      />
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item label={<b>Datum des Belegs:</b>} initialValue={dayjs()} name="datum">
            <DatePicker allowClear={false} format={"ddd DD.MM.YYYY"} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Row>
            <Upload {...uploadprops}>
              <ButtonWithIcon icon="FileEarmarkPlus" text="Auswählen" />
            </Upload>
          </Row>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={24}>
          <Form.Item label={<b>Kommentar:</b>} name="kommentar" required>
            <TextArea rows={10} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
