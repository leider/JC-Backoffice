import { useQuery } from "@tanstack/react-query";
import { historyRowsFor } from "@/rest/loader.ts";
import React, { useCallback, useEffect, useState } from "react";
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

  const switchCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed]);

  return (
    <List.Item
      actions={[
        <ButtonWithIcon
          icon={collapsed ? "PlusCircleFill" : "DashCircleFill"}
          key="button"
          onClick={switchCollapsed}
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

function HistoryRowListItem({ item, expanded }: { readonly item: HistoryRow; readonly expanded: boolean }) {
  const renderItem = useCallback(
    (inner: HistoryRow) => <ChangeSection expanded={expanded} item={inner} surrounding={item.header} />,
    [expanded, item.header],
  );

  return (
    <List.Item key={item.header}>
      <List.Item.Meta description={<List dataSource={item.asList} renderItem={renderItem} size="small" />} title={item.header} />
    </List.Item>
  );
}

export function Changelog({ id, collection, expanded }: { readonly collection: string; readonly id?: string; readonly expanded: boolean }) {
  const { data: changelog } = useQuery({
    enabled: !!id,
    queryKey: ["history", collection, id],
    queryFn: () => historyRowsFor(collection, id!),
  });

  const renderItem = useCallback((item: HistoryRow) => <HistoryRowListItem expanded={expanded} item={item} />, [expanded]);

  return <List dataSource={changelog?.rows} renderItem={renderItem} size="small" />;
}
