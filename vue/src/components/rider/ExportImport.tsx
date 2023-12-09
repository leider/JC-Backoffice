import { BoxParams } from "@/components/rider/types.ts";
import ButtonWithIcon from "@/widgets/ButtonWithIcon.tsx";
import { exportRiderAsJson } from "@/commons/loader.ts";
import React from "react";
import { App, Upload, UploadProps } from "antd";
import { rawInventory } from "@/components/rider/Inventory.ts";

export function ExportRiderButton({ boxes }: { boxes: BoxParams[] }) {
  return (
    <ButtonWithIcon
      key="Export"
      text="Export"
      icon="Download"
      onClick={() => {
        exportRiderAsJson(boxes);
      }}
    />
  );
}

export function ImportRiderButton({ setTargetBoxes }: { setTargetBoxes: (boxes: BoxParams[]) => void }) {
  const { notification } = App.useApp();

  const uploadprops: UploadProps = {
    accept: "application/json",
    beforeUpload: () => {
      return false;
    },
    maxCount: 1,
    showUploadList: false,
    onChange: async (info) => {
      if (info.fileList.length) {
        const result = await info.fileList[0].originFileObj?.text();
        if (result) {
          try {
            setTargetBoxes(
              (JSON.parse(result) as BoxParams[]).map((box) => {
                const inv = rawInventory.find((each) => each.id === box.id);
                return inv ? { ...box, ...inv } : box;
              }),
            );
          } catch (e) {
            notification.error({
              message: "Fehler",
              description: `Datei kann nicht interpretiert werden.
${e}`,
            });
          }
        }
      }
    },
  };

  return (
    <Upload key="Import" {...uploadprops}>
      <ButtonWithIcon text="Import" icon="Upload" />
    </Upload>
  );
}
