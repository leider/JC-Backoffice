import type { FC } from "react";
import { useMemo } from "react";
import type { InventoryElement } from "./types.ts";
import { List } from "antd";
import { ExtrasElement } from "@/components/rider/ExtrasElement.tsx";

export const ExtrasContainer: FC = () => {
  const boxes: InventoryElement[] = useMemo(() => {
    return [{ id: "Extra", title: "Eigener Inhalt", width: 50, height: 50, category: "Extra" }];
  }, []);

  return (
    <div>
      <List bordered size="small" dataSource={boxes} renderItem={(each) => <ExtrasElement item={each} />} />
    </div>
  );
};
