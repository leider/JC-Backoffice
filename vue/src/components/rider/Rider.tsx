import type { FC } from "react";
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TargetContainer } from "@/components/rider/TargetContainer.tsx";
import { DndProvider, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Col, Collapse, ConfigProvider, Row, Upload, UploadProps } from "antd";
import { BoxParams, Category, InventoryElement } from "@/components/rider/types.ts";
import { SourceContainer } from "@/components/rider/SourceContainer.tsx";
import { PageHeader } from "@ant-design/pro-layout";
import ButtonWithIcon from "@/widgets/ButtonWithIcon.tsx";
import { exportRiderAsJson } from "@/commons/loader.ts";
import { rawInventory } from "@/components/rider/Inventory.ts";

export const BoxesContext = createContext<{
  sourceBoxes: InventoryElement[];
  targetBoxes: BoxParams[];
  dropOntoTarget: (x: { offset?: XYCoord | null; delta?: XYCoord | null; item: BoxParams }) => void;
  dropOntoSource: (x: { item: InventoryElement }) => void;
}>({
  sourceBoxes: [],
  targetBoxes: [],
  dropOntoTarget: () => {},
  dropOntoSource: () => {},
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

  const targetContainer = useRef<HTMLDivElement | null>(null);

  const [sourceBoxes, setSourceBoxes] = useState<InventoryElement[]>(inventory);

  const [targetBoxes, setTargetBoxes] = useState<BoxParams[]>([]);

  const [isTouch, setIsTouch] = useState<boolean>(false);

  const dropOntoTarget = useCallback(
    ({ offset, delta, item }: { offset?: XYCoord | null; delta?: XYCoord | null; item: BoxParams }) => {
      const boxes = targetBoxes;
      const setBoxes = setTargetBoxes;
      const oppositeBoxes = sourceBoxes;
      const setOppositeBoxes = setSourceBoxes;
      const alreadyIn = boxes.map((b) => b.id).includes(item.id);
      const result = [...boxes];
      if (alreadyIn) {
        const box = result.find((b) => b.id === item.id);
        if (box) {
          const left = Math.round(item.left + (delta?.x || 0));
          const top = Math.round(item.top + (delta?.y || 0));
          box.left = left;
          box.top = top;
          return setTargetBoxes(result);
        }
      }
      const rect = targetContainer.current?.getBoundingClientRect();
      const newLeft = (offset?.x || 0) - (rect?.x || 0);
      const newTop = (offset?.y || 0) - (rect?.y || 0);

      const otherBoxes = oppositeBoxes.filter((b) => b.id !== item.id);
      result.push({ ...item, left: newLeft, top: newTop });
      setBoxes(result);
      setOppositeBoxes(otherBoxes);
    },
    [sourceBoxes, targetBoxes],
  );

  const dropOntoSource = useCallback(
    ({ item }: { item: InventoryElement }) => {
      const result = [...sourceBoxes];
      result.push({ ...item });
      setSourceBoxes(result);
      setTargetBoxes(targetBoxes.filter((b) => b.id !== item.id));
    },
    [sourceBoxes, targetBoxes],
  );

  function downloadRider() {
    function removeContent(boxes: BoxParams[]) {
      return boxes.map((box) => ({ category: box.category, id: box.id, top: box.top, left: box.left, degree: box.degree }));
    }
    const riderJson = { targetBoxes: removeContent(targetBoxes) };
    exportRiderAsJson(riderJson);
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
          return inv ? { ...inv, top: box.top, left: box.left, degree: box.degree } : { ...rawInventory[0], top: 0, left: 0, degree: 0 };
        });
      }

      function calculateSources(boxes: BoxParams[]) {
        const boxIds = boxes.map((box) => box.id);
        return inventory.filter((inv) => boxIds.includes(inv.id));
      }

      if (info.fileList.length) {
        const result = await info.fileList[0].originFileObj?.text();
        if (result) {
          const rider = JSON.parse(result);
          setSourceBoxes(calculateSources(rider.targetBoxes));
          setTargetBoxes(prepareImport(rider.targetBoxes));
        }
      }
    },
  };

  const items = useMemo(
    () =>
      (["Keys", "Drums", "Bass", "Guitar"] as Category[]).map((key) => {
        return { key, label: key, children: <SourceContainer cat={key} /> };
      }),
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
        <BoxesContext.Provider value={{ sourceBoxes, targetBoxes, dropOntoTarget, dropOntoSource }}>
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
              <div ref={targetContainer}>
                <TargetContainer />
              </div>
            </Col>
          </Row>
        </BoxesContext.Provider>
      </DndProvider>
    </>
  );
};
