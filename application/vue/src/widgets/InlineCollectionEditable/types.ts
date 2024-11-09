import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";

export type ColDescWithIdx = CollectionColDesc & {
  idx: number;
  alignValueWithMin?: boolean;
  disabled?: boolean;
  usersWithKann?: UserWithKann[];
};

export type CollectionColumnWidth = "xs" | "s" | "m" | "l" | "xl";

export type CollectionColDesc = Omit<ColDesc, "width"> & {
  width: CollectionColumnWidth;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: () => any;
  waitForOptionsToLoad?: boolean; // Selects only
  usersWithKann?: UserWithKann[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionCallbackType = (item: any, idx: number) => void;

export interface ActionParams {
  copy?: boolean;
  copyCallback?: ActionCallbackType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteCallback?: (items: any[]) => void;
  askBeforeDelete?: boolean;
  edit?: boolean;
  editCallback?: ActionCallbackType;
  view?: boolean;
  viewCallback?: ActionCallbackType;
}

export type ColType =
  | "color"
  | "user"
  | "id"
  | "idArray"
  | "date"
  | "timestamp"
  | "text"
  | "textArray"
  | "integer"
  | "twoDecimals"
  | "sevenDecimals"
  | "eightDecimals"
  | "basic"
  | "boolean";

/**
 * An abstraction over the width, to specify how wide a column should be.
 * The columns should add up to 12, but if not possible, there's a workaround on the third point.
 *
 *   * Two columns with 6 ColumnWidth will make them equal. Same with four columns 3 width.
 *   * When it does not add up to 12, it will distribute the remaining space between the columns.
 *   * In cases like for 7 equal columns, you can specify a width of 3 or more on all of them, to get them equal sized.
 * The only important part is having the numbers add up to something greater than 12.
 *
 */
export type ColumnWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Define a Column in a columnar Widget
 *
 */
export interface ColDesc {
  type: ColType;
  fieldName: string | string[];
  width?: ColumnWidth;
  label?: string;
  filters?: string[];
  shallTranslate?: boolean;
  translationNamespace?: string;
  urlPrefix?: string;
  actionParams?: ActionParams;
  required?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isPercentage?: (row: any) => boolean;
  /**
   * use only if you do not provide an initial value for the collection itself
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValue?: any;
  min?: number | string;
  exclusiveMin?: boolean;
  max?: number | string;
  exclusiveMax?: boolean;
  pattern?: RegExp;
  /**
   * special disable functionality for migration matrices
   */
  disabled?: boolean;
  uniqueValues?: boolean;
}

export type CollectionHeight = "xs" | "sm" | "md" | "lg" | "xl";
