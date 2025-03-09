import { useQuery } from "@tanstack/react-query";
import { historyRowsFor } from "@/rest/loader.ts";
import React, { useEffect, useState } from "react";
import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";
import { nordTheme } from "@uiw/react-json-view/nord";
import { List } from "antd";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { HistoryRow } from "@/rest/historyObject.ts";

function ChangeSection({
  item,
  surrounding,
  expanded,
}: {
  readonly item: HistoryRow;
  readonly surrounding: string;
  readonly expanded: boolean;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const { isDarkMode } = useJazzContext();
  useEffect(() => {
    setCollapsed(!expanded);
  }, [expanded]);

  return (
    <List.Item
      actions={[
        <ButtonWithIcon
          icon={collapsed ? "PlusCircleFill" : "DashCircleFill"}
          key="button"
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          tooltipTitle={collapsed ? "Ausklappen" : "Zuklappen"}
        />,
      ]}
      key={item + surrounding}
    >
      <List.Item.Meta
        description={
          <JsonView
            collapsed={collapsed}
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard
            style={isDarkMode ? nordTheme : lightTheme}
            value={item.neu}
          />
        }
        title="Nachher"
      />
      <List.Item.Meta
        description={
          <JsonView
            collapsed={collapsed}
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard
            style={isDarkMode ? nordTheme : lightTheme}
            value={item.alt}
          />
        }
        title="Vorher"
      />
    </List.Item>
  );
}

export function Changelog({ id, collection, expanded }: { readonly collection: string; readonly id?: string; readonly expanded: boolean }) {
  const { data: changelog } = useQuery({
    enabled: !!id,
    queryKey: ["history", collection, id],
    queryFn: () => historyRowsFor(collection, id!),
  });

  return (
    <List
      dataSource={changelog?.rows}
      renderItem={(item) => (
        <List.Item key={item.header}>
          <List.Item.Meta
            description={
              <List
                dataSource={item.asList}
                renderItem={(inner) => <ChangeSection expanded={expanded} item={inner} surrounding={item.header} />}
                size="small"
              />
            }
            title={item.header}
          />
        </List.Item>
      )}
      size="small"
    />
  );
}
