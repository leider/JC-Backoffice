import { Form, FormItemProps } from "antd";

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
          const value = names.map((name) => form.getFieldValue(name));
          if (value.every((v) => v === undefined)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return undefined as unknown as { value: any[] };
          }
          return { value };
        }}
        getValueFromEvent={(values) => {
          // Set the form store values for names
          const fieldData = names.map((name, index) => ({ name, value: values?.[index] }));
          form.setFields(fieldData);
          return values?.[0];
        }}
        rules={rules.map((rule) => {
          if (typeof rule === "object" && rule) {
            return {
              ...rule,
              transform: () => names.map((name) => form.getFieldValue(name)),
            };
          }
          return rule;
        })}
        {...rest}
      />
      {/*  Bind other fields so they can getFieldValue to get values and setFields to set values */}
      {tailNames.map((name) => (
        <Form.Item key={name?.toString()} name={name} noStyle />
      ))}
    </>
  );
}
