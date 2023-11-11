import React, { useEffect, useState } from "react";
import { Col, Collapse, ConfigProvider, Row, theme } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { ButtonInAdminPanel } from "@/components/Buttons.tsx";
import headerTags from "@/components/colored/headerTags.tsx";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import AdminContent from "@/components/team/TeamBlock/AdminContent.tsx";

function Extras({ vermietung }: { vermietung: Vermietung }) {
  const [tagsForTitle, setTagsForTitle] = useState<any[]>([]);

  useEffect(() => {
    const confirmed = vermietung.kopf.confirmed;
    const technikOK = vermietung.technik.checked;
    const presseOK = vermietung.presse.checked;
    const homepage = vermietung.kopf.kannAufHomePage;
    const social = vermietung.kopf.kannInSocialMedia;

    const taggies: { label: string; color: boolean }[] = [{ label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed || false }];
    if (vermietung.brauchtTechnik) {
      taggies.push({ label: "Technik", color: technikOK });
    }
    if (vermietung.brauchtPresse) {
      taggies.push({ label: "Presse", color: presseOK });
    }
    taggies.push({ label: "Homepage", color: homepage }, { label: "Social Media", color: social });

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
  const [color, setColor] = useState<string>("");
  const { useToken } = theme;
  const { token } = useToken();
  useEffect(
    () => {
      setColor((token as any)["custom-color-vermietung"]);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [vermietung],
  );

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
          activeKey={expanded ? vermietung.id : ""}
          onChange={() => {
            setExpanded(!expanded);
          }}
          expandIcon={({ isActive }) => (isActive ? <CaretDown /> : <CaretRight />)}
          items={[
            {
              key: vermietung.id || "",
              style: { backgroundColor: color },
              className: "team-block",
              label: <TeamBlockHeader veranstaltungOderVermietung={vermietung} expanded={expanded} />,
              extra: expanded && <Extras vermietung={vermietung} />,
              children: (
                <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
                  <AdminContent veranstaltungOderVermietung={vermietung}></AdminContent>{" "}
                </ConfigProvider>
              ),
            },
          ]}
        />
      </Col>
    </ConfigProvider>
  );
}
