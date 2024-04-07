import { Collapse, ConfigProvider, List } from "antd";
import { ReactNode } from "react";

export default function HelpSection({
  initiallyOpen,
  label,
  items,
}: {
  initiallyOpen?: boolean;
  label: ReactNode;
  items: { title: ReactNode; content: ReactNode; description?: string }[];
}) {
  return (
    <ConfigProvider theme={{ components: { Collapse: { contentPadding: 0, headerPadding: 0 } } }}>
      <Collapse
        defaultActiveKey="stuff"
        ghost
        items={[
          {
            key: initiallyOpen ? "stuff" : "",
            label: label,
            children: (
              <List
                bordered
                dataSource={items}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta title={item.title} description={item.description} />
                    {item.content}
                  </List.Item>
                )}
              />
            ),
          },
        ]}
      />
    </ConfigProvider>
  );
}
