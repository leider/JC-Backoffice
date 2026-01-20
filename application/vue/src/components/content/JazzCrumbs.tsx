import * as React from "react";
import { Breadcrumb } from "antd";
import type { BreadcrumbProps, MenuProps } from "antd";
import type { BreadcrumbItemProps } from "antd/es/breadcrumb/BreadcrumbItem";
import { useMemo } from "react";
import { useCreateMenuItems } from "@/components/content/menu/useCreateMenuItems.tsx";
import compact from "lodash/compact";
import find from "lodash/find";
import isNil from "lodash/isNil";
import map from "lodash/map";
import size from "lodash/size";
import some from "lodash/some";

type MenuItem = NonNullable<MenuProps["items"]>[number];
type Key = React.Key;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getKey = (it: any): Key | undefined => it?.key;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getLabel = (it: any): React.ReactNode => it?.label;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getChildren = (it: any): MenuItem[] => (it?.children ?? []) as MenuItem[];

function findChain(items: MenuItem[], activeKey?: Key, chain: MenuItem[] = []): MenuItem[] | null {
  if (isNil(activeKey) || !some(items)) return null;

  const hitHere = find(items, (it) => !isNil(it) && getKey(it) === activeKey);
  if (hitHere) return [...chain, hitHere];

  // search children (DFS)
  for (const it of compact(items)) {
    const next = [...chain, it];
    const hit = findChain(getChildren(it), activeKey, next);
    if (hit) return hit;
  }
  return null;
}

function toNestedBreadcrumbMenu(nodes: MenuItem[], onNavigate?: (key: Key) => void): BreadcrumbItemProps["menu"] {
  const items = compact(
    map(nodes, (n) => {
      const key = getKey(n);
      if (isNil(key)) return null;

      const children = getChildren(n);
      return {
        key: String(key),
        label: getLabel(n) ?? String(key),
        // nested submenu
        children: size(children) ? toNestedBreadcrumbMenu(children, onNavigate)?.items : undefined,
      };
    }),
  ) as NonNullable<BreadcrumbItemProps["menu"]>["items"];

  if (!size(items)) return undefined;

  return {
    items,
    onClick: ({ key }) => onNavigate?.(key),
  };
}

export function JazzCrumbs({ activeKey, onNavigate }: { readonly activeKey?: Key; readonly onNavigate?: (key: Key) => void }) {
  const menuItems = useCreateMenuItems();

  const withApplicationNode = useMemo(
    () =>
      [
        {
          key: "application",
          label: "Jazz",
          children: menuItems,
        },
      ] as MenuItem[],
    [menuItems],
  );

  const chain = findChain(withApplicationNode, activeKey) ?? [];

  const items: BreadcrumbProps["items"] = map(chain, (node) => {
    const children = getChildren(node);

    return {
      title: getLabel(node),
      menu: size(children) ? toNestedBreadcrumbMenu(children, onNavigate) : undefined,
    };
  });

  return <Breadcrumb items={items} style={{ marginTop: 8 }} />;
}
