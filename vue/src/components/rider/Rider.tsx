import type { FC } from "react";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { TargetContainer } from "@/components/rider/TargetContainer.tsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { App, Col, Collapse, ConfigProvider, Row, Upload, UploadProps } from "antd";
import { BoxParams } from "@/components/rider/types.ts";
import { SourceContainer } from "@/components/rider/SourceContainer.tsx";
import { PageHeader } from "@ant-design/pro-layout";
import ButtonWithIcon from "@/widgets/ButtonWithIcon.tsx";
import { exportRiderAsJson } from "@/commons/loader.ts";
import { Category, InventoryElement, rawInventory } from "@/components/rider/Inventory.ts";
import { ExtrasContainer } from "@/components/rider/ExtrasContainer.tsx";

export const BoxesContext = createContext<{
  sourceBoxes: InventoryElement[];
  targetBoxes: BoxParams[];
  setSourceBoxes: (elements: InventoryElement[]) => void;
  setTargetBoxes: (boxes: BoxParams[]) => void;
}>({
  sourceBoxes: [],
  targetBoxes: [],
  setSourceBoxes: () => {},
  setTargetBoxes: () => {},
});

export const Rider: FC = () => {
  const inventory = useMemo(
    () =>
      rawInventory.map((inv) => ({
        ...inv,
      })),
    [],
  );

  useEffect(() => {
    try {
      document.createEvent("TouchEvent");
      setIsTouch(true);
    } catch {
      setIsTouch(false);
    }
  }, []);

  const [sourceBoxes, setSourceBoxes] = useState<InventoryElement[]>(inventory);

  const [targetBoxes, setTargetBoxes] = useState<BoxParams[]>([]);

  const [isTouch, setIsTouch] = useState<boolean>(false);

  const { notification } = App.useApp();
  function downloadRider() {
    exportRiderAsJson(targetBoxes);
  }

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
            const boxes = JSON.parse(result) as BoxParams[];
            const boxIds = boxes.map((box) => box.id);
            setSourceBoxes(inventory.filter((inv) => !boxIds.includes(inv.id)));
            setTargetBoxes(
              boxes.map((box) => {
                const inv = inventory.find((each) => each.id === box.id);
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

  const items = useMemo(
    () =>
      (["Keys", "Drums", "Bass", "Guitar"] as Category[])
        .map((key) => {
          return { key, label: key as string, children: <SourceContainer cat={key} /> };
        })
        .concat([{ key: "Extra", label: "Extras", children: <ExtrasContainer /> }]),
    [],
  );

  return (
    <>
      <PageHeader
        title="Rider"
        extra={[
          <ButtonWithIcon key="Export" text="Export" icon="Download" onClick={downloadRider} />,
          <Upload key="Import" {...uploadprops}>
            <ButtonWithIcon text="Import" icon="Upload" />
          </Upload>,
        ]}
      />
      <DndProvider backend={isTouch ? TouchBackend : HTML5Backend}>
        <BoxesContext.Provider value={{ sourceBoxes, targetBoxes, setSourceBoxes, setTargetBoxes }}>
          <Row gutter={16} style={{ paddingTop: "32px" }}>
            <Col span={4}>
              <ConfigProvider
                theme={{
                  components: {
                    Collapse: {
                      contentPadding: 0,
                    },
                  },
                }}
              >
                <Collapse defaultActiveKey="Keys" accordion items={items} />
              </ConfigProvider>
            </Col>
            <Col span={20}>
              <TargetContainer />
            </Col>
          </Row>
        </BoxesContext.Provider>
      </DndProvider>
    </>
  );
};
