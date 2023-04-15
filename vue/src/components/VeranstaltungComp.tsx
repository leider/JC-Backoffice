import * as React from "react";
import { useEffect } from "react";
import { Tabs } from "antd";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { veranstaltungForUrl } from "@/commons/loader-for-react";

export default function VeranstaltungComp() {
  const [search, setSearch] = useSearchParams();
  const { url } = useParams();
  const veranst = useQuery({ queryKey: ["veranstaltung", url], queryFn: () => veranstaltungForUrl(url || "") });

  useEffect(() => {}, [veranst.data]);

  return (
    <Tabs
      type="card"
      defaultActiveKey="technik"
      activeKey={search.get("page") ?? "allgemein"}
      items={[
        {
          key: "allgemein",
          label: `allgemein`,
          children: `${veranst.data?.id} 1 ${search} ${url}`,
        },
        {
          key: "technik",
          label: `technik`,
          children: `${veranst.data?.id} 2`,
        },
        {
          key: "ausgaben",
          label: `ausgaben`,
          children: `${veranst.data?.id} 3`,
        },
      ]}
      onChange={(a) => {
        setSearch({ page: a });
      }}
    />
  );
}
