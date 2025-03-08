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
      actions={[
        <ButtonWithIcon
          icon={collapsed ? "PlusCircleFill" : "DashCircleFill"}
          key="button"
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          tooltipTitle={collapsed ? "Ausklappen" : "Zuklappen"}
        />,
      ]}
      key={item.typ + surrounding}
    >
      <List.Item.Meta
        description={
          <JsonView
            collapsed={collapsed}
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard
            style={isDarkMode ? nordTheme : lightTheme}
            value={item.val}
          />
        }
        title={item.typ}
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
