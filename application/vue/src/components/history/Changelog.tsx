import { useQuery } from "@tanstack/react-query";
import { historyRowsFor } from "@/commons/loader.ts";
import React, { useEffect, useState } from "react";
import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";
import { nordTheme } from "@uiw/react-json-view/nord";
import { List } from "antd";
import { DiffType } from "jc-shared/commons/comparingAndTransforming.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";

function ChangeSection({ item, surrounding, expanded }: { item: { typ: DiffType; val: object }; surrounding: string; expanded: boolean }) {
  const [collapsed, setCollapsed] = useState(true);
  const { isDarkMode } = useJazzContext();
  useEffect(() => {
    setCollapsed(!expanded);
  }, [expanded]);

  return (
    <List.Item
      key={item.typ + surrounding}
      actions={[
        <ButtonWithIcon
          key="button"
          size="small"
          icon={collapsed ? "PlusCircleFill" : "DashCircleFill"}
          tooltipTitle={collapsed ? "Ausklappen" : "Zuklappen"}
          onClick={() => setCollapsed(!collapsed)}
        />,
      ]}
    >
      <List.Item.Meta
        title={item.typ}
        description={
          <JsonView
            collapsed={collapsed}
            value={item.val}
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard
            style={isDarkMode ? nordTheme : lightTheme}
          />
        }
      />
    </List.Item>
  );
}

export function Changelog({ id, collection, expanded }: { collection: string; id?: string; expanded: boolean }) {
  const { data: changelog } = useQuery({
    enabled: !!id,
    queryKey: ["history", collection, id],
    queryFn: () => historyRowsFor(collection, id!),
  });

  return (
    <List
      size="small"
      dataSource={changelog?.rows}
      renderItem={(item) => (
        <List.Item key={item.header}>
          <List.Item.Meta
            title={item.header}
            description={
              <List
                size="small"
                dataSource={item.asList}
                renderItem={(inner) => <ChangeSection item={inner} surrounding={item.header} expanded={expanded} />}
              />
            }
          />
        </List.Item>
      )}
    />
  );
}
