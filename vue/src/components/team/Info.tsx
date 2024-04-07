import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { Button, Col, Divider, Row, Tabs, TabsProps, Typography } from "antd";
import { konzerteBetweenYYYYMM } from "@/commons/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import { useQuery } from "@tanstack/react-query";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import applyTeamFilter from "@/components/team/applyTeamFilter.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import useFilterAsTags from "@/components/team/TeamFilter.tsx";

export default function Info() {
  const { filter } = useJazzContext();
  const { monatJahr } = useParams(); // als yymm
  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("pressetexte");

  const start = useMemo(() => {
    return DatumUhrzeit.forYYMM(monatJahr || "");
  }, [monatJahr]);

  const end = useMemo(() => {
    return DatumUhrzeit.forYYMM(monatJahr || "").plus({ monate: 1 });
  }, [monatJahr]);

  const { data } = useQuery({
    queryKey: ["konzert", `${start.yyyyMM}`],
    queryFn: () => konzerteBetweenYYYYMM(start.yyyyMM, end.yyyyMM),
  });

  const veranstaltungen = useMemo(() => (data ?? []).filter(applyTeamFilter(filter)), [data, filter]);

  useEffect(
    () => {
      const tab = search.get("tab") ?? "";
      if (["pressetexte", "uebersicht"].includes(tab)) {
        setActivePage(tab);
      } else {
        setActivePage("pressetexte");
        setSearch({ tab: "pressetexte" });
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [search],
  );

  const { color } = colorsAndIconsForSections;

  function TabLabel({ title, type }: { type: string; title: string }) {
    const farbe = color("allgemeines");
    const active = activePage === type;
    return (
      <b
        style={{
          margin: -16,
          padding: 16,
          backgroundColor: active ? farbe : "inherit",
          color: active ? "#FFF" : farbe,
        }}
      >
        {title}
      </b>
    );
  }

  function Pressetexte() {
    return (
      <RowWrapper>
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
      </RowWrapper>
    );
  }

  function Uebersicht() {
    return (
      <RowWrapper>
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
      </RowWrapper>
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

  const filterTags = useFilterAsTags();

  return (
    <>
      <JazzPageHeader
        title={`Infos für ${veranstaltungen[0]?.startDatumUhrzeit.monatJahrKompakt}`}
        tags={filterTags}
        buttons={[
          <a href={`/imgzip/${monatJahr!}`}>
            <Button icon={<IconForSmallBlock size={16} iconName={"Download"} />}>Alle Bilder als ZIP</Button>
          </a>,
        ]}
      ></JazzPageHeader>
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
