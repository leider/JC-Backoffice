import { Form, FormItemProps } from "antd";
import isObject from "lodash/isObject";
import isNil from "lodash/isNil";
import map from "lodash/map";
import every from "lodash/every";
import { useCallback } from "react";
import { NamePath } from "antd/es/form/interface";

interface AggregateProps extends FormItemProps {
  readonly left: NamePath;
  readonly right: NamePath;
}

export default function Aggregate(props: AggregateProps) {
  const form = Form.useFormInstance();

  const { left, right, rules = [], ...rest } = props;

  const getValueFromEvent = useCallback(
    (values: unknown[]) => {
      // Set the form store values for names
      const fieldData = map([left, right], (name, index) => ({ name, value: values?.[index] }));
      form.setFields(fieldData);
      return values?.[0];
    },
    [form, left, right],
  );

  const getValueProps = useCallback(() => {
    // Convert the values of names into an array passed to children
    const value = map([left, right], (name) => form.getFieldValue(name));
    if (every(value, isNil)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return undefined as unknown as { value: any[] };
    }
    return { value };
  }, [form, left, right]);

  return (
    <>
      <Form.Item
        getValueFromEvent={getValueFromEvent}
        getValueProps={getValueProps}
        name={left}
        rules={map(rules, (rule) => {
          if (isObject(rule) && rule) {
            return {
              ...rule,
              transform: () => map([left, right], (name) => form.getFieldValue(name)),
            };
          }
          return rule;
        })}
        {...rest}
      />
      <Form.Item name={right} noStyle />
    </>
  );
}
