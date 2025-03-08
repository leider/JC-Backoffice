import { Form, List, Radio } from "antd";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import React, { useEffect } from "react";
import { CheckboxGroupProps } from "antd/es/checkbox";
import useJazzPrefs, { JazzPrefs } from "@/app/useJazzPrefs.ts";
import { JazzModal } from "@/widgets/JazzModal.tsx";

export default function Preferences({ isOpen, setIsOpen }: { readonly isOpen: boolean; readonly setIsOpen: (x: boolean) => void }) {
  const [form] = Form.useForm<JazzPrefs>();
  const { setPreferences, getPreferences } = useJazzPrefs();

  useEffect(() => {
    const prefs = getPreferences();
    form.setFieldsValue(prefs);
  }, [form, getPreferences]);

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

  function saveForm() {
    setPreferences(form.getFieldsValue(true));
  }

  return (
    <JazzModal
      cancelButtonProps={{ type: "text" }}
      cancelText=" "
      okText="Schließen"
      onCancel={() => setIsOpen(false)}
      onOk={() => setIsOpen(false)}
      open={isOpen}
    >
      <Form form={form} onValuesChange={saveForm}>
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
          renderItem={(item) => {
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
          }}
          size="small"
        />
      </Form>
    </JazzModal>
  );
}
