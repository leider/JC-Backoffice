import { Form, List, Radio } from "antd";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import React, { useEffect } from "react";
import { CheckboxGroupProps } from "antd/es/checkbox";
import useJazzPrefs, { JazzPrefs } from "@/app/useJazzPrefs.ts";
import { JazzModal } from "@/widgets/JazzModal.tsx";

export default function Preferences({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (x: boolean) => void }) {
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
      open={isOpen}
      cancelButtonProps={{ type: "text" }}
      cancelText=" "
      okText="Schließen"
      onOk={() => setIsOpen(false)}
      onCancel={() => setIsOpen(false)}
    >
      <Form form={form} onValuesChange={saveForm}>
        <JazzPageHeader
          title="Anzeige Einstellungen"
          buttons={[
            <span key="subtext">
              Hier legst Du fest, wie sich die <b>Anzeige für dieses Gerät</b> verhalten soll.
            </span>,
          ]}
        />
        <List
          size="small"
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
                key={item.title}
                actions={[
                  <Form.Item key={item.name} name={item.name}>
                    <Radio.Group
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                      block
                      options={item.options}
                      optionType="button"
                      buttonStyle="solid"
                    />
                  </Form.Item>,
                ]}
              >
                <List.Item.Meta title={item.title} description={item.desc} />
              </List.Item>
            );
          }}
        />
      </Form>
    </JazzModal>
  );
}
