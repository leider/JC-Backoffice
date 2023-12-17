import React, { useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { Col, Collapse, ConfigProvider } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import headerTags from "@/components/colored/headerTags.tsx";
import AdminContent from "@/components/team/TeamBlock/AdminContent.tsx";

interface TeamBlockAdminProps {
  veranstaltung: Veranstaltung;
  initiallyOpen: boolean;
}

function TeamBlockAdmin({ veranstaltung, initiallyOpen }: TeamBlockAdminProps) {
  const [color, setColor] = useState<string | undefined>("");

  useEffect(() => {
    setColor(veranstaltung.kopf.eventTypRich?.color);
  }, [veranstaltung]);

  const [expanded, setExpanded] = useState<boolean>();
  useEffect(() => {
    setExpanded(initiallyOpen);
  }, [initiallyOpen]);
  return (
    <ConfigProvider theme={{ token: { fontSizeIcon: expanded ? 18 : 14 } }}>
      <Col xs={24} sm={12} lg={8} xl={6} xxl={4}>
        <Collapse
          style={{ borderColor: color }}
          size={"small"}
          activeKey={expanded ? veranstaltung.id : undefined}
          onChange={() => {
            setExpanded(!expanded);
          }}
          expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
          items={[
            {
              key: veranstaltung.id || "",
              style: { backgroundColor: color },
              className: "team-block",
              label: <TeamBlockHeader veranstaltungOderVermietung={veranstaltung} expanded={expanded} />,
              extra: expanded && <Extras veranstaltung={veranstaltung} />,
              children: (
                <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
                  <AdminContent veranstaltungOderVermietung={veranstaltung}></AdminContent>
                </ConfigProvider>
              ),
            },
          ]}
        />
      </Col>
    </ConfigProvider>
  );
}
function Extras({ veranstaltung }: { veranstaltung: Veranstaltung }) {
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
      { label: "Presse", color: presseOK },
      { label: "Homepage", color: homepage },
      { label: "Social Media", color: social },
    ];
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

export default TeamBlockAdmin;
