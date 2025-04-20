import { CheckboxOptionType, Form, List, Radio } from "antd";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import React, { useCallback, useEffect } from "react";
import { CheckboxGroupProps } from "antd/es/checkbox";
import useJazzPrefs, { JazzPrefs } from "@/app/useJazzPrefs.ts";
import { JazzModal } from "@/widgets/JazzModal.tsx";

const optionsHellDunkel: CheckboxGroupProps<string>["options"] = [
  { label: "Hell", value: "bright" },
  { label: "Dunkel", value: "dark" },
  { label: "Automatisch", value: "auto" },
];

const optionsKompaktNormal: CheckboxGroupProps<string>["options"] = [
  { label: "Normal", value: "normal" },
  { label: "Kompakt", value: "compact" },
  { label: "Automatisch", value: "auto" },
];

export default function Preferences({ isOpen, setIsOpen }: { readonly isOpen: boolean; readonly setIsOpen: (x: boolean) => void }) {
  const [form] = Form.useForm<JazzPrefs>();
  const { setPreferences, getPreferences } = useJazzPrefs();

  useEffect(() => {
    const prefs = getPreferences();
    form.setFieldsValue(prefs);
  }, [form, getPreferences]);

  const saveForm = useCallback(() => setPreferences(form.getFieldsValue(true)), [setPreferences, form]);

  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  const renderItem = useCallback(
    (item: { name: string; title: string; desc: string; options: (string | number | CheckboxOptionType<string>)[] | undefined }) => {
      return (
        <List.Item
          actions={[
            <Form.Item key={item.name} name={item.name}>
              <Radio.Group
                block
                buttonStyle="solid"
                optionType="button"
                options={item.options}
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              />
            </Form.Item>,
          ]}
          key={item.title}
        >
          <List.Item.Meta description={item.desc} title={item.title} />
        </List.Item>
      );
    },
    [],
  );

  return (
    <Form form={form} onValuesChange={saveForm}>
      <JazzModal cancelButtonProps={{ type: "text" }} cancelText=" " okText="Schließen" onCancel={close} onOk={close} open={isOpen}>
        <JazzPageHeader
          buttons={[
            <span key="subtext">
              Hier legst Du fest, wie sich die <b>Anzeige für dieses Gerät</b> verhalten soll.
            </span>,
          ]}
          title="Anzeige Einstellungen"
        />
        <List
          dataSource={[
            {
              name: "darkPref",
              title: "Hell / Dunkel",
              desc: "Entweder fest für dieses Gerät oder automatisch durch die Einstellungen Deines Geräts.",
              options: optionsHellDunkel,
            },
            {
              name: "compactPref",
              title: "Kompakt / Normal",
              desc: "Entweder fest für dieses Gerät oder automatisch. Die Automatik wählt den kompakten Modus für schmale Anzeige wie bspw. auf einem Handy.",
              options: optionsKompaktNormal,
            },
          ]}
          renderItem={renderItem}
          size="small"
        />
      </JazzModal>
    </Form>
  );
}
