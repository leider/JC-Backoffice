import { Form } from 'antd';
import { NamePath, StoreValue } from 'rc-field-form/es/interface';
import { FunctionComponent } from 'react';

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
  renderWidget: (
    getFieldValue: (name: NamePath) => StoreValue,
    setFieldsValue: (value: any) => void
  ) => JSX.Element;
}

/**
 * A dynamic form component.
 * @param {IDynamicItem} props
 * @return {*}  {JSX.Element}
 */
export const DynamicItem: FunctionComponent<IDynamicItem> = (
  props: IDynamicItem
): JSX.Element => (
  <Form.Item
    noStyle
    shouldUpdate={(prevValues, curValues) => {
      if (Array.isArray(props.nameOfDepending)) {
        const prev = props.nameOfDepending.reduce(
          (prev: any, curr) => prev && prev[curr],
          prevValues
        );
        const curr = props.nameOfDepending.reduce(
          (prev: any, curr) => prev && prev[curr],
          curValues
        );
        return prev !== curr;
      }
      return (
        prevValues[props.nameOfDepending as string] !==
        curValues[props.nameOfDepending as string]
      );
    }}
  >
    {({ getFieldValue, setFieldsValue }) =>
      props.renderWidget(getFieldValue, setFieldsValue)
    }
  </Form.Item>
);
