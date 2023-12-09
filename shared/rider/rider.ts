/* eslint-disable  @typescript-eslint/no-explicit-any*/
import { InventoryElement } from "./inventory.js";
import Misc from "../commons/misc.js";

export interface BoxParams extends InventoryElement {
  top: number;
  left: number;
  degree: number;
  level: number;
  comment?: string;
}

export class Rider {
  id = "";
  startDate: Date = new Date();
  boxes: BoxParams[] = [];

  constructor(object?: any) {
    Object.assign(this, object, {
      startDate: Misc.stringOrDateToDate(object?.startDate || ""),
      boxes: object?.boxes || [],
    });
  }

  toJSON(): object {
    return Object.assign({}, this);
  }
}
