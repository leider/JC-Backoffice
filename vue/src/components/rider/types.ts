export interface DragItem {
  type: string;
  id: string;
  top: number;
  left: number;
  title: string;
}

export const ItemTypes = {
  BOX: "box",
};

export interface BoxParams {
  id: string;
  top: number;
  left: number;
  title: string;
}
