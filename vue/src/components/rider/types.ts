import { InventoryElement } from "@/components/rider/Inventory.ts";

export interface DragItem extends BoxParams {
  type: string;
}

export const ItemTypes = {
  BOX: "box",
  SourceElement: "source-element",
};

export interface BoxParams extends InventoryElement {
  top: number;
  left: number;
  degree: number;
}

export type Category = "Keys" | "Drums" | "Bass" | "Guitar";
