import { InventoryElement } from "@/components/rider/Inventory.ts";

export const ItemTypes = {
  BOX: "box",
  SourceElement: "source-element",
};

export interface BoxParams extends InventoryElement {
  top: number;
  left: number;
  degree: number;
  level: number;
  comment?: string;
}

export interface DragItem extends BoxParams {
  type: string;
}
