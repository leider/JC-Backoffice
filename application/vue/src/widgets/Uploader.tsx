import { Col, FormInstance, Popover, Row, Space, Tag, Upload, UploadFile, UploadProps } from "antd";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags.tsx";
import React, { useEffect, useState } from "react";
import { RcFile } from "antd/es/upload";
import { uploadFile } from "@/commons/loader.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import { CustomTagProps } from "rc-select/lib/BaseSelect";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

interface UploaderParams {
  form: FormInstance<Konzert> | FormInstance<Vermietung>;
  name: string[];
  typ: string;
  onlyImages?: boolean;
}

export default function Uploader({ form, name, typ, onlyImages = false }: UploaderParams) {
  const [options, setOptions] = useState<string[]>([]);
  const genericForm = form as unknown as FormInstance<Veranstaltung>;

  useEffect(
    () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setOptions(genericForm.getFieldValue(name as any) || []);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form],
  );

  async function saveFiles() {
    setUploading(true);
    const formData = new FormData();
    formData.append("id", genericForm.getFieldValue("id") || "");
    formData.append("typ", typ);
    fileList.forEach((file) => {
      formData.append("datei", file as RcFile, file.name);
    });
    try {
      const newVeranstaltung = await uploadFile(formData);
      setFileList([]);
      const strings = name.reduce((prev, curr) => prev[curr], newVeranstaltung);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genericForm.setFieldValue(name as any, strings);
    } catch {
      // eslint-disable-next-line no-console
      console.error("Oops");
    } finally {
      setUploading(false);
    }
  }

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadprops: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };
  const tagRender = (props: CustomTagProps) => {
    const content =
      typ === "pressefoto" ? (
        <img src={`/imagepreview/${props.label}`} alt="bild" width="100%" />
      ) : (
        <a href={`/files/${props.label}`}>{props.label} </a>
      );
    return (
      <Popover content={content} title={typ === "pressefoto" ? "Vorschau" : "Klick zur Ansicht / Download"}>
        <Tag {...props}>{props.label}</Tag>
      </Popover>
    );
  };

  return (
    <Row>
      <Col>
        <Space align="end">
          <MultiSelectWithTags name={name} label="Dateien" options={options} style={{ marginBottom: "0" }} specialTagRender={tagRender} />
          <Upload {...uploadprops} accept={onlyImages ? "image/*" : undefined}>
            <ButtonWithIcon icon="FileEarmarkPlus" text="Auswählen" type="default" />
          </Upload>
          <ButtonWithIcon
            text={uploading ? "Lädt..." : "Hochladen"}
            icon="Upload"
            onClick={saveFiles}
            disabled={fileList.length === 0}
            loading={uploading}
          />
        </Space>
      </Col>
    </Row>
  );
}
