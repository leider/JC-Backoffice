import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { Button, Col, Divider, Row, Tabs, TabsProps, Typography } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { imgZip, veranstaltungenBetweenYYYYMM } from "@/commons/loader-for-react";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { IconForSmallBlock } from "@/components/Icon";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview";

export default function Info() {
  const { monatJahr } = useParams(); // als yymm
  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("pressetexte");
  const [veranstaltungen, setVeranstaltungen] = useState<Veranstaltung[]>([]);

  useEffect(() => {
    async function load() {
      if (monatJahr) {
        const start = DatumUhrzeit.forYYMM(monatJahr).yyyyMM;
        const end = DatumUhrzeit.forYYMM(monatJahr).plus({ monate: 1 }).yyyyMM;
        const res = await veranstaltungenBetweenYYYYMM(start, end);
        setVeranstaltungen(res);
      }
    }
    load();
  }, [monatJahr]);

  useEffect(() => {
    const tab = search.get("tab") ?? "";
    if (["pressetexte", "uebersicht"].includes(tab)) {
      setActivePage(tab);
    } else {
      setActivePage("pressetexte");
      setSearch({ tab: "pressetexte" });
    }
  }, [search]);

  const { color } = useColorsAndIconsForSections("allgemeines");

  function TabLabel({ title, type }: { type: string; title: string }) {
    const farbe = color();
    const active = activePage === type;
    return <b style={{ margin: -16, padding: 16, backgroundColor: active ? farbe : "inherit", color: active ? "#FFF" : farbe }}>{title}</b>;
  }

  function Pressetexte() {
    return (
      <Row gutter={12}>
        {veranstaltungen.map((veranst) => {
          return (
            <Col lg={12} key={veranst.id}>
              <PressePreview veranstaltung={veranst} />
              <Divider />
            </Col>
          );
        })}
      </Row>
    );
  }

  function Uebersicht() {
    return (
      <>
        <Row gutter={12}>
          <Col span={24}>
            {veranstaltungen.map((veranst) => (
              <p key={veranst.id}>
                <b>{veranst.kopf.titelMitPrefix}</b>
                <br />
                <b>
                  <i>{veranst.startDatumUhrzeit.wochentagTagMonat}</i> // {veranst.startDatumUhrzeit.uhrzeitKompakt} Uhr
                  <br />
                </b>
                {veranst.kopf.presseInEcht}
              </p>
            ))}
          </Col>
        </Row>
        <Divider />
        <Row gutter={12}>
          <Col span={24}>
            <Typography.Title level={4}>Bilder</Typography.Title>
          </Col>
        </Row>
        <Row gutter={12}>
          {veranstaltungen
            .filter((v) => v.presse.image.length > 0)
            .map((veranst) => (
              <Col lg={12} key={veranst.id}>
                <p>&nbsp;</p>
                <p>
                  <b>{veranst.kopf.titelMitPrefix}</b>
                </p>
                {veranst.presse.image.map((img) => (
                  <span key={img}>
                    <img src={`/upload/${encodeURIComponent(img)}`} width="100%" />
                    <br />
                  </span>
                ))}
              </Col>
            ))}
        </Row>
      </>
    );
  }

  const allTabs: TabsProps["items"] = [
    {
      key: "pressetexte",
      label: <TabLabel type="pressetexte" title="Pressetexte" />,
      children: <Pressetexte />,
    },
    {
      key: "uebersicht",
      label: <TabLabel type="uebersicht" title="Übersicht" />,
      children: <Uebersicht />,
    },
  ];

  return (
    <>
      <PageHeader
        title={`Infos für ${veranstaltungen[0]?.startDatumUhrzeit.monatJahrKompakt}`}
        extra={
          <Button icon={<IconForSmallBlock size={16} iconName={"Download"} onClick={() => imgZip(monatJahr!)} />}>
            Alle Bilder als ZIP
          </Button>
        }
      ></PageHeader>
      <Tabs
        type="card"
        activeKey={activePage}
        items={allTabs}
        onChange={(newPage) => {
          setSearch({ tab: newPage });
        }}
      />
    </>
  );
}
