import type { FC } from "react";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { TargetContainer } from "@/components/rider/TargetContainer.tsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Col, Collapse, ConfigProvider, Row, Upload, UploadProps } from "antd";
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
        top: 0,
        left: 0,
        degree: 0,
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

  function downloadRider() {
    exportRiderAsJson(targetBoxes);
  }

  const uploadprops: UploadProps = {
    beforeUpload: () => {
      return false;
    },
    showUploadList: false,

    onChange: async (info) => {
      function prepareImport(boxes: BoxParams[]) {
        return boxes.map((box) => {
          const inv = inventory.find((each) => each.id === box.id);
          return inv ? { ...inv, top: box.top, left: box.left, degree: box.degree, level: box.level } : box;
        });
      }

      function calculateSources(boxes: BoxParams[]) {
        const boxIds = boxes.map((box) => box.id);
        return inventory.filter((inv) => !boxIds.includes(inv.id));
      }

      if (info.fileList.length) {
        const result = await info.fileList[0].originFileObj?.text();
        if (result) {
          const rider = JSON.parse(result);
          setSourceBoxes(calculateSources(rider));
          setTargetBoxes(prepareImport(rider));
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
