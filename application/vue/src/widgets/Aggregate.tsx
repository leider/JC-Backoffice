import { Form, FormItemProps } from "antd";
import isObject from "lodash/isObject";
import isNil from "lodash/isNil";
import map from "lodash/map";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AggregateProps<V = any> extends FormItemProps<V> {
  names?: FormItemProps<V>["name"][];
}

export default function Aggregate(props: AggregateProps) {
  const form = Form.useFormInstance();

  const { names = [], rules = [], ...rest } = props;
  const [firstName, ...tailNames] = names;
  return (
    <>
      <Form.Item
        name={firstName}
        // Convert the values of names into an array passed to children
        getValueProps={() => {
          const value = map(names, (name) => form.getFieldValue(name));
          if (value.every(isNil)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return undefined as unknown as { value: any[] };
          }
          return { value };
        }}
        getValueFromEvent={(values) => {
          // Set the form store values for names
          const fieldData = map(names, (name, index) => ({ name, value: values?.[index] }));
          form.setFields(fieldData);
          return values?.[0];
        }}
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
