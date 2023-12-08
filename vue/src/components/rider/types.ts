export type Category = "Keys" | "Drums" | "Bass" | "Guitar";

export const ItemTypes = {
  BOX: "box",
  SourceElement: "source-element",
};

export interface InventoryElement {
  id: string;
  title: string;
  width: number;
  height: number;
  img?: { src: string; width?: number; height?: number };
  photo?: { src: string; width?: number; height?: number };
  category: Category;
}

export interface BoxParams extends InventoryElement {
  top: number;
  left: number;
  degree: number;
  level: number;
}

export interface DragItem extends BoxParams {
  type: string;
}
