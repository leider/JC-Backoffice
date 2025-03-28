import { Form } from "antd";
import { NamePath, StoreValue } from "rc-field-form/es/interface";

interface IDynamicItem {
  /**
   * The name of the depending items.
   * @type {(string | string[])}
   * @memberof IDynamicItem
   */
  readonly nameOfDepending: string | string[];

  /**
   * Callback to render the widget.
   * @memberof IDynamicItem
   */
  readonly renderWidget: (getFieldValue: (name: NamePath) => StoreValue) => React.ReactElement;
}

/**
 * A dynamic form component.
 * @param {IDynamicItem} props
 * @return {*}  {React.ReactElement}
 */
export function DynamicItem({ nameOfDepending, renderWidget }: IDynamicItem): React.ReactElement {
  return (
    <Form.Item
      noStyle
      shouldUpdate={(prevValues, curValues) => {
        if (Array.isArray(nameOfDepending)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const prev = nameOfDepending.reduce((prev: any, curr) => prev && prev[curr], prevValues);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const curr = nameOfDepending.reduce((prev: any, curr) => prev && prev[curr], curValues);
          return prev !== curr;
        }
        return prevValues[nameOfDepending as string] !== curValues[nameOfDepending as string];
      }}
    >
      {({ getFieldValue }) => renderWidget(getFieldValue)}
    </Form.Item>
  );
}
