import React, { useEffect, useState } from "react";
import { Col, Collapse, ConfigProvider } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import headerTags from "@/components/colored/headerTags.tsx";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import AdminContent from "@/components/team/TeamBlock/AdminContent.tsx";

function Extras({ vermietung }: { vermietung: Vermietung }) {
  const [tagsForTitle, setTagsForTitle] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    const confirmed = vermietung.kopf.confirmed;
    const technikOK = vermietung.technik.checked;
    const presseOK = vermietung.presse.checked;
    const homepage = vermietung.kopf.kannAufHomePage;
    const social = vermietung.kopf.kannInSocialMedia;
    const bar = vermietung.brauchtBar;

    const taggies: { label: string; color: boolean }[] = [{ label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed || false }];
    if (vermietung.brauchtTechnik) {
      taggies.push({ label: "Technik", color: technikOK });
    }
    if (vermietung.brauchtPresse) {
      taggies.push({ label: "Presse", color: presseOK });
    }
    taggies.push({ label: "Homepage", color: homepage }, { label: "Social Media", color: social }, { label: "Bar einladen", color: bar });

    setTagsForTitle(headerTags(taggies, true));
  }, [vermietung]);

  return (
    <ConfigProvider theme={{ token: { fontSize: 11 } }}>
      <div style={{ width: "70px" }}>{tagsForTitle}</div>
    </ConfigProvider>
  );
}
interface TeamBlockVermietungProps {
  vermietung: Vermietung;
  initiallyOpen: boolean;
}

export default function TeamBlockVermietung({ vermietung, initiallyOpen }: TeamBlockVermietungProps) {
  const [expanded, setExpanded] = useState<boolean>(initiallyOpen);
  useEffect(() => {
    setExpanded(initiallyOpen);
  }, [initiallyOpen]);

  return (
    <ConfigProvider theme={{ token: { fontSizeIcon: expanded ? 18 : 14 } }}>
      <Col span={24}>
        {vermietung.ghost ? (
          <div style={{ backgroundColor: vermietung.color, padding: "2px 16px" }}>
            <TeamBlockHeader veranstaltung={vermietung} expanded={initiallyOpen} />
          </div>
        ) : (
          <Collapse
            style={{ borderColor: vermietung.color }}
            size={"small"}
            activeKey={expanded ? vermietung.id : ""}
            onChange={() => {
              setExpanded(!expanded);
            }}
            expandIcon={({ isActive }) => (isActive ? <CaretDown /> : <CaretRight />)}
            items={[
              {
                key: vermietung.id || "",
                style: { backgroundColor: vermietung.color },
                className: "team-block",
                label: <TeamBlockHeader veranstaltung={vermietung} expanded={expanded} />,
                extra: expanded && <Extras vermietung={vermietung} />,
                children: (
                  <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
                    <AdminContent veranstaltung={vermietung} />
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
