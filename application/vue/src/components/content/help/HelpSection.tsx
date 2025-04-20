import { Collapse, ConfigProvider, List } from "antd";
import { ReactNode, useCallback } from "react";

export default function HelpSection({
  initiallyOpen,
  label,
  items,
}: {
  readonly initiallyOpen?: boolean;
  readonly label: ReactNode;
  readonly items: { title: ReactNode; content: ReactNode; description?: string }[];
}) {
  const renderItem = useCallback(
    (item: { title: ReactNode; content: ReactNode; description?: string }) => (
      <List.Item>
        <List.Item.Meta description={item.description} title={item.title} />
        {item.content}
      </List.Item>
    ),
    [],
  );

  return (
    <ConfigProvider theme={{ components: { Collapse: { contentPadding: 0, headerPadding: 0 } } }}>
      <Collapse
        defaultActiveKey="stuff"
        ghost
        items={[
          {
            key: initiallyOpen ? "stuff" : "",
            label: label,
            children: <List bordered dataSource={items} renderItem={renderItem} />,
          },
        ]}
      />
    </ConfigProvider>
  );
}
