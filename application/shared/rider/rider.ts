import { Category, InventoryElement } from "./inventory.js";
import Misc from "../commons/misc.js";

export interface BoxParams extends InventoryElement {
  top: number;
  left: number;
  degree: number;
  comment?: string;
}

export class Rider {
  id = "";
  startDate: Date = new Date();
  boxes: BoxParams[] = [];

  constructor(object?: Partial<Rider>) {
    Object.assign(this, object, {
      startDate: Misc.stringOrDateToDate(object?.startDate || ""),
      boxes: object?.boxes || [],
    });
  }

  toJSON(): object {
    return Object.assign({}, this);
  }
}

export class PrintableBox implements BoxParams {
  category: Category = "Extra";
  degree: number = 0;
  height: number = 0;
  id: string = "";
  left: number = 0;
  level: number = 0;
  title: string = "";
  top: number = 0;
  width: number = 0;
  img: { src: string; width?: number; height?: number } | undefined = undefined;
  isCircle = false;

  constructor(params: BoxParams) {
    Object.assign(this, params);
  }

  get divStyleForImg() {
    return `position: absolute; left: ${this.left}px; top: ${this.top}px; width: ${this.width}px; height: ${this.height}px; rotate: ${this.degree}deg; z-index: ${this.level};`;
  }

  get imgStyle() {
    return `width: ${this.img?.width}px; height: ${this.img?.height}px;`;
  }
  get divStyleForText() {
    return (
      this.divStyleForImg +
      `line-height: ${this.height}px;` +
      "text-align: center; font-size: 10px; border: 0.2px solid gray;" +
      `border-radius: ${this.isCircle ? "50%" : 0};`
    );
  }
}
