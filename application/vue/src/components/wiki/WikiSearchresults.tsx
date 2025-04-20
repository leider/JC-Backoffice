import { searchWiki } from "@/rest/loader.ts";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { List, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";

export default function WikiSearchresults() {
  const { searchtext } = useParams();
  const { data } = useQuery({
    queryKey: ["wiki", `${searchtext}`],
    queryFn: () => searchWiki(searchtext!),
  });
  const [matches, setMatches] = useState<{ pageName: string; line: string; text: string }[]>([]);

  useEffect(() => {
    if (data) {
      setMatches(data.matches);
    }
  }, [data]);

  const renderItem = useCallback(
    (item: { pageName: string; line: string; text: string }) => (
      <List.Item>
        <List.Item.Meta
          description={item.text ? item.text : ""}
          title={
            <span>
              <Link to={`/wiki/${item.pageName}`}>{item.pageName}</Link>
              {item.line ? " (in Zeile " + item.line + ")" : ""}
              {!item.text ? " (im Dateinamen)" : ""}
            </span>
          }
        />
      </List.Item>
    ),
    [],
  );

  return (
    <>
      <JazzPageHeader dateString={`für "${searchtext}"`} title="Wiki Suchergebnisse" />
      {matches.length === 0 ? (
        <Typography.Title level={2}>Keine Ergebnisse</Typography.Title>
      ) : (
        <List dataSource={matches} renderItem={renderItem} size="small" />
      )}
    </>
  );
}
