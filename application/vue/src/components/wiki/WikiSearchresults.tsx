import { searchWiki } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
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

  return (
    <>
      <JazzPageHeader title="Wiki Suchergebnisse" dateString={`für "${searchtext}"`} />
      {matches.length === 0 ? (
        <Typography.Title level={2}>Keine Ergebnisse</Typography.Title>
      ) : (
        <List
          size="small"
          dataSource={matches}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <span>
                    <Link to={`/wiki/${item.pageName}`}>{item.pageName}</Link>
                    {item.line ? " (in Zeile " + item.line + ")" : ""}
                    {!item.text ? " (im Dateinamen)" : ""}
                  </span>
                }
                description={item.text ? item.text : ""}
              />
            </List.Item>
          )}
        />
      )}
    </>
  );
}
