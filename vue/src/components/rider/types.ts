export interface DragItem extends BoxParams {
  type: string;
}

export const ItemTypes = {
  BOX: "box",
  SourceElement: "source-element",
};

export interface BoxParams {
  id: string;
  top: number;
  left: number;
  content: React.ReactElement;
}
