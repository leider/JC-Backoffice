export interface DragItem extends BoxParams {
  type: string;
}

export const ItemTypes = {
  BOX: "box",
  SourceElement: "source-element",
};

export interface BoxParams {
  id: string;
  title: string;
  top: number;
  left: number;
  content: React.ReactElement;
  category: Category;
}

export type Category = "Keys" | "Drums" | "Bass" | "Guitar";
