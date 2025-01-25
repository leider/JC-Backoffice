import React, { useEffect, useMemo, useState } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import { Col, Collapse, ConfigProvider } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import headerTags from "@/components/colored/headerTags.tsx";
import AdminContent from "@/components/team/TeamBlock/AdminContent.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

function Extras({ veranstaltung }: { veranstaltung: Konzert }) {
  const [tagsForTitle, setTagsForTitle] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    const confirmed = veranstaltung.kopf.confirmed;
    const technikOK = veranstaltung.technik.checked;
    const presseOK = veranstaltung.presse.checked;
    const homepage = veranstaltung.kopf.kannAufHomePage;
    const social = veranstaltung.kopf.kannInSocialMedia;
    const abgesagt = veranstaltung.kopf.abgesagt;
    const brauchtHotel = veranstaltung.artist.brauchtHotel;
    const hotel = veranstaltung.unterkunft.bestaetigt;

    const taggies: { label: string; color: boolean }[] = [
      { label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed },
      { label: "Technik", color: technikOK },
    ];
    if (veranstaltung.brauchtPresse) {
      taggies.push({ label: "Presse", color: presseOK });
    }
    taggies.push({ label: "Homepage", color: homepage }, { label: "Social Media", color: social });

    if (abgesagt) {
      taggies.unshift({ label: "ABGESAGT", color: false });
    }
    if (brauchtHotel) {
      taggies.push({ label: "Hotel", color: hotel });
    }
    setTagsForTitle(headerTags(taggies, true));
  }, [veranstaltung]);

  return (
    <ConfigProvider theme={{ token: { fontSize: 11 } }}>
      <div style={{ width: "70px" }}>{tagsForTitle}</div>
    </ConfigProvider>
  );
}

export default function TeamBlockAdmin({ veranstaltung, initiallyOpen }: { veranstaltung: Konzert; initiallyOpen: boolean }) {
  const { memoizedId, isDarkMode } = useJazzContext();
  const highlight = useMemo(() => veranstaltung.id === memoizedId, [memoizedId, veranstaltung.id]);
  const [expanded, setExpanded] = useState<boolean>(initiallyOpen || highlight);
  useEffect(() => {
    setExpanded(initiallyOpen || highlight);
  }, [highlight, initiallyOpen]);

  const textColor = useMemo(() => veranstaltung.colorText(isDarkMode), [isDarkMode, veranstaltung]);

  return (
    <ConfigProvider theme={{ token: { fontSizeIcon: expanded ? 18 : 14 } }}>
      <Col span={24} id={veranstaltung.id} style={highlight ? { border: "solid 4px" } : undefined}>
        {veranstaltung.ghost ? (
          <div style={{ backgroundColor: veranstaltung.color, padding: "2px 16px" }}>
            <TeamBlockHeader veranstaltung={veranstaltung} expanded={initiallyOpen} />
          </div>
        ) : (
          <Collapse
            style={{ borderColor: veranstaltung.color }}
            size={"small"}
            activeKey={expanded ? veranstaltung.id : undefined}
            onChange={() => {
              setExpanded(!expanded);
            }}
            expandIcon={({ isActive }) => (isActive ? <CaretDown color={textColor} /> : <CaretRight color={textColor} />)}
            items={[
              {
                key: veranstaltung.id || "",
                style: { backgroundColor: veranstaltung.color },
                className: "team-block",
                label: <TeamBlockHeader veranstaltung={veranstaltung} expanded={expanded} />,
                extra: expanded && <Extras veranstaltung={veranstaltung} />,
                children: (
                  <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
                    <AdminContent veranstaltung={veranstaltung}></AdminContent>
                  </ConfigProvider>
                ),
              },
            ]}
          />
        )}
      </Col>
    </ConfigProvider>
  );
}
