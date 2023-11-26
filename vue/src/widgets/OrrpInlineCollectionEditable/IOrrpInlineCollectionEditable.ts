import { FormInstance } from "antd";
import { ValidatorRule } from "rc-field-form/lib/interface";

import { CollectionColDesc, CollectionHeight } from "./types";

interface CommonParams {
  /**
   * Array that describes the path in the form object
   * leading to this field.
   */
  embeddedArrayPath: string[];

  /**
   * Antd's form
   */
  form: FormInstance;

  /**
   * The initial value of the field
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValue?: any;

  /**
   * The text label of the field
   */
  label?: string;

  /**
   * Whether or not this field is required
   */
  required?: boolean;

  /**
   * number of allowed columns
   */
  maxRows?: number;

  /**
   * Whether or not this field is disabled (no plus sign)
   */
  disabled?: boolean;

  /**
   * Whether or not this field will be emptied on disable
   */
  clearOnDisabled?: boolean;

  /**
   * A fixed max height
   */
  maxHeight?: string;

  /**
   * The standardized height of the component
   */
  height?: CollectionHeight;

  /**
   * optional callback for changes;
   * @param value
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void;

  /**
   * List of rules to be checked on "submit". Example see "HaircutModal.tsx"
   * @type {ValidatorRule[]}
   * @memberof CommonParams
   */
  rules?: ValidatorRule[];
}

export interface OrrpInlineCollectionEditableObjectParams extends CommonParams {
  /**
   * What the columns look like
   */
  columnDescriptions: CollectionColDesc[];
}

export type TOrrpInlineCollectionEditable = OrrpInlineCollectionEditableObjectParams;
