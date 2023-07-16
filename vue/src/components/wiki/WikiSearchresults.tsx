import { PageHeader } from "@ant-design/pro-layout";
import { searchWiki } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

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
      <PageHeader title="Wiki Suchergebnisse" subTitle={`für "${searchtext}"`} extra={[]} />
      {matches.length === 0 ? (
        <h3>Keine Ergebnisse</h3>
      ) : (
        <>
          {matches.map((match) => (
            <Row key={JSON.stringify(match)} gutter={12}>
              <Col span={8}>
                <Link to={`/wiki/${match.pageName}`}>{match.pageName}</Link>
                <span>{match.line ? " (in Zeile " + match.line + ")" : ""}</span>
              </Col>
              <Col span={16}>{match.text ? <em>{match.text}</em> : "(im Dateinamen)"}</Col>
            </Row>
          ))}
        </>
      )}
    </>
  );
}
