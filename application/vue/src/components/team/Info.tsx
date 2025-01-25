import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { Button, Col, Divider, Tabs, TabsProps, Typography } from "antd";
import { konzerteBetweenYYYYMM } from "@/commons/loader.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import { useQuery } from "@tanstack/react-query";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import applyTeamFilter from "@/components/team/TeamFilter/applyTeamFilter.ts";
import TeamFilter from "@/components/team/TeamFilter/TeamFilter.tsx";
import map from "lodash/map";
import filter from "lodash/filter";
import Konzert from "jc-shared/konzert/konzert.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function Info() {
  const { filter: contextFilter } = useJazzContext();
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

  const veranstaltungen = useMemo(() => filter(data, applyTeamFilter(contextFilter)), [data, contextFilter]);

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
    const { isDarkMode } = useJazzContext();
    const brightText = useMemo(() => (isDarkMode ? "#dcdcdc" : "#fff"), [isDarkMode]);
    return (
      <b style={{ margin: -16, padding: 16, backgroundColor: active ? farbe : "inherit", color: active ? brightText : farbe }}>{title}</b>
    );
  }

  function Pressetexte() {
    return (
      <RowWrapper>
        <JazzRow>
          {map(veranstaltungen, (veranst) => (
            <Col lg={12} key={veranst.id}>
              <PressePreview veranstaltung={veranst} />
              <Divider />
            </Col>
          ))}
        </JazzRow>
      </RowWrapper>
    );
  }

  function Uebersicht() {
    return (
      <RowWrapper>
        <JazzRow>
          <Col span={24}>
            {map(veranstaltungen, (veranst) => (
              <p key={veranst.id}>
                <b>{veranst.kopf.titelMitPrefix}</b>
                <br />
                <b>
                  {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                  <i>{veranst.startDatumUhrzeit.wochentagTagMonat}</i> // {veranst.startDatumUhrzeit.uhrzeitKompakt} Uhr
                  <br />
                </b>
                {veranst.kopf.presseInEcht}
              </p>
            ))}
          </Col>
        </JazzRow>
        <Divider />
        <JazzRow>
          <Col span={24}>
            <Typography.Title level={4}>Bilder</Typography.Title>
          </Col>
        </JazzRow>
        <JazzRow>
          {map(filter(veranstaltungen, "presse.image.length"), (veranst: Konzert) => (
            <Col lg={12} key={veranst.id}>
              <p>
                <b>{veranst.kopf.titelMitPrefix}</b>
              </p>
              {map(veranst.presse.image, (img) => (
                <span key={img}>
                  <img src={`/upload/${encodeURIComponent(img)}`} width="100%" />
                  <br />
                </span>
              ))}
            </Col>
          ))}
        </JazzRow>
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

  const filterTags = TeamFilter();

  return (
    <>
      <JazzPageHeader
        title={`Infos für ${veranstaltungen[0]?.startDatumUhrzeit.monatJahrKompakt}`}
        tags={filterTags}
        buttons={[
          <a href={`/imgzip/${monatJahr!}`} key="imgzip">
            <Button icon={<IconForSmallBlock size={16} iconName={"Download"} />}>Alle Bilder als ZIP</Button>
          </a>,
        ]}
      />
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
