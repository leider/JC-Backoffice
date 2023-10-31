import { Button, Col, FormInstance, Popover, Row, Space, Tag, Upload, UploadFile, UploadProps } from "antd";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import { IconForSmallBlock } from "@/components/Icon";
import React, { useEffect, useState } from "react";
import { RcFile } from "antd/es/upload";
import { uploadFile } from "@/commons/loader.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { CustomTagProps } from "rc-select/lib/BaseSelect";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

interface UploaderParams {
  form: FormInstance<Veranstaltung | Vermietung>;
  name: string[];
  typ: string;
  onlyImages?: boolean;
}

export default function Uploader({ form, name, typ, onlyImages = false }: UploaderParams) {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(
    () => {
      setOptions(form.getFieldValue(name) || []);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form],
  );

  async function saveFiles() {
    setUploading(true);
    const formData = new FormData();
    formData.append("id", form.getFieldValue("id") || "");
    formData.append("typ", typ);
    fileList.forEach((file) => {
      formData.append("datei", file as RcFile, file.name);
    });
    try {
      const newVeranstaltung = await uploadFile(formData);
      setFileList([]);
      const strings = name.reduce((prev, curr) => prev[curr], newVeranstaltung);
      form.setFieldValue(name, strings);
    } catch (e) {
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
            <Button icon={<IconForSmallBlock iconName="FileEarmarkPlus" />}> &nbsp; Auswählen</Button>
          </Upload>
          <Button
            icon={<IconForSmallBlock iconName="Upload" />}
            type="primary"
            onClick={saveFiles}
            disabled={fileList.length === 0}
            loading={uploading}
          >
            &nbsp; {uploading ? "Lädt..." : "Hochladen"}
          </Button>
        </Space>
      </Col>
    </Row>
  );
}
