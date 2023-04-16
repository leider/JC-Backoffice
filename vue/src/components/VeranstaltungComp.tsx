import * as React from "react";
import { useEffect, useState } from "react";
import { Button, Col, Row, Tabs, TabsProps, theme } from "antd";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { veranstaltungForUrl } from "@/commons/loader-for-react";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { IconForSmallBlock } from "@/components/Icon";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import fieldHelpers from "jc-shared/commons/fieldHelpers";

export default function VeranstaltungComp() {
  const [search, setSearch] = useSearchParams();
  const { url } = useParams();
  const veranst = useQuery({ queryKey: ["veranstaltung", url], queryFn: () => veranstaltungForUrl(url || "") });

  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung());
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const { icon } = useColorsAndIconsForSections("allgemeines");

  const { useToken } = theme;
  const { token } = useToken();
  const [typeColor, setTypeColor] = useState<string>("");
  useEffect(() => {
    const code = `custom-color-${fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp)}`;
    setTypeColor((token as any)[code]);
  }, [veranstaltung]);

  useEffect(() => {
    if (veranst.data) {
      setVeranstaltung(veranst.data);
    }
  }, [veranst.data]);

  useEffect(() => {
    const page = search.get("page") ?? "";
    if (["allgemeines", "technik", "ausgaben", "hotel", "kasse", "presse"].includes(page)) {
      setActivePage(page);
    } else {
      setActivePage("allgemeines");
      setSearch({ page: "allgemeines" });
    }
  }, [search]);

  function TabLabel(props: { type: buttonType; title: string }) {
    return (
      <div
        style={{ margin: -16, padding: 8 }}
        className={activePage === props.type ? `${"color"}-${props.type}` : `${"tab"}-${props.type}`}
      >
        <IconForSmallBlock iconName={icon(props.type)} /> {props.title}
      </div>
    );
  }

  const allTabs: TabsProps["items"] = [
    {
      key: "allgemeines",
      label: <TabLabel type="allgemeines" title="Allgemeines" />,
      children: `${veranst.data?.id} 1 ${search} ${url}`,
    },
    {
      key: "technik",
      label: <TabLabel type="technik" title="Technik" />,
      children: `${veranst.data?.id} 2`,
    },
    {
      key: "ausgaben",
      label: <TabLabel type="ausgaben" title="Ausgaben" />,
      children: `${veranst.data?.id} 3`,
    },
    {
      key: "hotel",
      label: <TabLabel type="hotel" title="Hotel" />,
      children: `${veranst.data?.id} 4`,
    },
    {
      key: "kasse",
      label: <TabLabel type="kasse" title="Kasse" />,
      children: `${veranst.data?.id} 5`,
    },
    {
      key: "presse",
      label: <TabLabel type="presse" title="Presse" />,
      children: `${veranst.data?.id} 6`,
    },
  ];
  const [tabs, setTabs] = useState<TabsProps["items"]>(allTabs);
  useEffect(() => {
    if (veranstaltung.artist.brauchtHotel) {
      setTabs(allTabs);
    } else {
      const result = [...allTabs];
      result.splice(3, 1);
      setTabs(result);
    }
  }, [veranstaltung.artist.brauchtHotel, activePage]);

  return (
    <>
      <Row>
        <Col span={12}>
          <h2 style={{ color: typeColor }}>
            {veranstaltung.kopf.titelMitPrefix}
            <br />
            <small>am {veranstaltung.datumForDisplayShort}</small>
          </h2>
        </Col>
        <Col span={12}>
          <Row justify="end">
            <Button icon={<IconForSmallBlock iconName="Trash" />} type="primary" style={{ backgroundColor: token["colorError"] }}>
              &nbsp;Löschen
            </Button>
            <Button icon={<IconForSmallBlock iconName="Trash" />} type="primary" style={{ backgroundColor: token["colorTextTertiary"] }}>
              &nbsp;Kopieren
            </Button>
          </Row>
        </Col>
      </Row>
      <Tabs
        type="card"
        defaultActiveKey="technik"
        activeKey={activePage}
        items={tabs}
        onChange={(newPage) => {
          setSearch({ page: newPage });
        }}
      />
    </>
  );
}
