import { BoxParams } from "jc-shared/rider/rider.ts";

export const ItemTypes = {
  BOX: "box",
  SourceElement: "source-element",
};

export interface DragItem extends BoxParams {
  type: string;
}
