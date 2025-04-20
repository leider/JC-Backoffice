import { Form, FormItemProps } from "antd";
import isObject from "lodash/isObject";
import isNil from "lodash/isNil";
import map from "lodash/map";
import every from "lodash/every";
import { useCallback } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AggregateProps<V = any> extends FormItemProps<V> {
  readonly names?: FormItemProps<V>["name"][];
}

export default function Aggregate(props: AggregateProps) {
  const form = Form.useFormInstance();

  const { names = [], rules = [], ...rest } = props;
  const [firstName, ...tailNames] = names;

  const getValueFromEvent = useCallback(
    (values: unknown[]) => {
      // Set the form store values for names
      const fieldData = map(names, (name, index) => ({ name, value: values?.[index] }));
      form.setFields(fieldData);
      return values?.[0];
    },
    [form, names],
  );

  const getValueProps = useCallback(() => {
    // Convert the values of names into an array passed to children
    const value = map(names, (name) => form.getFieldValue(name));
    if (every(value, isNil)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return undefined as unknown as { value: any[] };
    }
    return { value };
  }, [form, names]);

  return (
    <>
      <Form.Item
        getValueFromEvent={getValueFromEvent}
        getValueProps={getValueProps}
        name={firstName}
        rules={map(rules, (rule) => {
          if (isObject(rule) && rule) {
            return {
              ...rule,
              transform: () => map(names, (name) => form.getFieldValue(name)),
            };
          }
          return rule;
        })}
        {...rest}
      />
      {/*  Bind other fields so they can getFieldValue to get values and setFields to set values */}
      {map(tailNames, (name) => (
        <Form.Item key={name?.toString()} name={name} noStyle />
      ))}
    </>
  );
}
