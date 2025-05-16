import { Space, theme, UploadFile, UploadProps } from "antd";
import React from "react";
import Dragger from "antd/lib/upload/Dragger";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import find from "lodash/find";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

interface UploaderParams {
  readonly fileList: UploadFile[];
  readonly setFileList: (value: ((prevState: UploadFile[]) => UploadFile[]) | UploadFile[]) => void;
}

const maxFileSize = 2097152; // 2 MB

export default function UploaderForMail({ fileList, setFileList }: UploaderParams) {
  const { token } = theme.useToken();
  const { showError } = useJazzContext();

  const uploadprops: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      if (file.size > maxFileSize) {
        showError({ title: "Datei zu groß", text: "Die Datei darf maximal 20 Megabyte groß sein" });
        return false;
      }
      if (!find(fileList, { name: file.name })) {
        setFileList((prev) => [...prev, file]);
      }
      return true;
    },
    fileList,
    multiple: true,
  };

  return (
    <Space>
      <Dragger {...uploadprops} style={{ color: token.colorText }}>
        <IconForSmallBlock iconName="Upload" />
        <div>Für einen Anhang klicken oder Datei hierher ziehen</div>
        <div>Eine oder mehrere Dateien möglich.</div>
      </Dragger>
    </Space>
  );
}
