import { Form } from "antd";
import { NamePath, StoreValue } from "rc-field-form/es/interface";
import { FunctionComponent } from "react";

interface IDynamicItem {
  /**
   * The name of the depending items.
   * @type {(string | string[])}
   * @memberof IDynamicItem
   */
  nameOfDepending: string | string[];

  /**
   * Callback to render the widget.
   * @memberof IDynamicItem
   */
  renderWidget: (getFieldValue: (name: NamePath) => StoreValue) => React.ReactElement;
}

/**
 * A dynamic form component.
 * @param {IDynamicItem} props
 * @return {*}  {React.ReactElement}
 */
export const DynamicItem: FunctionComponent<IDynamicItem> = (props: IDynamicItem): React.ReactElement => (
  <Form.Item
    noStyle
    shouldUpdate={(prevValues, curValues) => {
      if (Array.isArray(props.nameOfDepending)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prev = props.nameOfDepending.reduce((prev: any, curr) => prev && prev[curr], prevValues);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const curr = props.nameOfDepending.reduce((prev: any, curr) => prev && prev[curr], curValues);
        return prev !== curr;
      }
      return prevValues[props.nameOfDepending as string] !== curValues[props.nameOfDepending as string];
    }}
  >
    {({ getFieldValue }) => props.renderWidget(getFieldValue)}
  </Form.Item>
);
