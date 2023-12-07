import type { FC } from "react";
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TargetContainer } from "@/components/rider/TargetContainer.tsx";
import { DndProvider, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Col, Row, Upload, UploadProps } from "antd";
import { BoxParams } from "@/components/rider/types.ts";
import { SourceContainer } from "@/components/rider/SourceContainer.tsx";
import { PageHeader } from "@ant-design/pro-layout";
import ButtonWithIcon from "@/widgets/ButtonWithIcon.tsx";
import { exportRiderAsJson } from "@/commons/loader.ts";
import { InventoryContent } from "@/components/rider/InventoryContent.tsx";
import { rawInventory } from "@/components/rider/Inventory.ts";

export const BoxesContext = createContext<{
  sourceBoxes: BoxParams[];
  targetBoxes: BoxParams[];
  moveBox: (x: { containerId: string; offset?: XYCoord | null; delta?: XYCoord | null; item: BoxParams }) => void;
}>({
  sourceBoxes: [],
  targetBoxes: [],
  moveBox: () => {},
});

export const Rider: FC = () => {
  const inventory = useMemo(
    () =>
      rawInventory.map((inv) => ({
        id: inv.id,
        title: inv.title,
        top: 0,
        left: 0,
        content: <InventoryContent inv={inv} />,
        category: inv.category,
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

  const [sourceBoxes, setSourceBoxes] = useState<BoxParams[]>(inventory);

  const [targetBoxes, setTargetBoxes] = useState<BoxParams[]>([]);

  const [isTouch, setIsTouch] = useState<boolean>(false);

  const moveBox = useCallback(
    ({ containerId, offset, delta, item }: { containerId: string; offset?: XYCoord | null; delta?: XYCoord | null; item: BoxParams }) => {
      const isSource = containerId === "source";
      const boxes = isSource ? sourceBoxes : targetBoxes;
      const setBoxes = isSource ? setSourceBoxes : setTargetBoxes;
      const oppositeBoxes = !isSource ? sourceBoxes : targetBoxes;
      const setOppositeBoxes = !isSource ? setSourceBoxes : setTargetBoxes;
      const alreadyIn = boxes.map((b) => b.id).includes(item.id);
      const result = [...boxes];
      if (!isSource && alreadyIn) {
        const box = result.find((b) => b.id === item.id);
        if (box) {
          const left = Math.round(item.left + (delta?.x || 0));
          const top = Math.round(item.top + (delta?.y || 0));
          box.left = left;
          box.top = top;
          return setBoxes(result);
        }
      }
      let newLeft = 0;
      let newTop = 0;
      if (!isSource) {
        const rect = targetContainer.current?.getBoundingClientRect();
        newLeft = (offset?.x || 0) - (rect?.x || 0);
        newTop = (offset?.y || 0) - (rect?.y || 0);
      }

      const otherBoxes = oppositeBoxes.filter((b) => b.id !== item.id);
      result.push({ ...item, left: newLeft, top: newTop });
      setBoxes(result);
      setOppositeBoxes(otherBoxes);
    },
    [sourceBoxes, targetBoxes],
  );

  function downloadRider() {
    function removeContent(boxes: BoxParams[]) {
      return boxes.map((box) => ({ category: box.category, id: box.id, top: box.top, left: box.left }));
    }
    const riderJson = { sourceBoxes: removeContent(sourceBoxes), targetBoxes: removeContent(targetBoxes) };
    exportRiderAsJson(riderJson);
  }

  const uploadprops: UploadProps = {
    beforeUpload: () => {
      return false;
    },
    showUploadList: false,

    async onChange(info) {
      function prepareImport(boxes: BoxParams[]) {
        return boxes.map((box) => {
          const inv = inventory.find((each) => each.id === box.id);
          return { ...box, title: inv?.title || "", content: inv?.content || <></> };
        });
      }

      if (info.fileList.length) {
        const result = await info.fileList[0].originFileObj?.text();
        if (result) {
          const rider = JSON.parse(result);
          setSourceBoxes(prepareImport(rider.sourceBoxes));
          setTargetBoxes(prepareImport(rider.targetBoxes));
        }
      }
    },
  };

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
        <BoxesContext.Provider value={{ sourceBoxes, targetBoxes, moveBox }}>
          <Row gutter={16} style={{ paddingTop: "32px" }}>
            <Col span={4}>
              <SourceContainer cat="Keys" />
              <SourceContainer cat="Drums" />
              <SourceContainer cat="Bass" />
              <SourceContainer cat="Guitar" />
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
