import React, { useEffect, useState } from "react";
import { Col, Collapse, ConfigProvider, Row, theme, Typography } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { ButtonInAdminPanel } from "@/components/Buttons.tsx";
import headerTags from "@/components/colored/headerTags.tsx";

const { Title } = Typography;

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
interface VermietungHeaderProps {
  vermietung: Vermietung;
  expanded?: boolean;
}

function VermietungHeader({ vermietung, expanded }: VermietungHeaderProps) {
  const titleStyle = { margin: 0 };
  function T({ l, t }: { l: 1 | 2 | 4 | 3 | 5 | undefined; t: string }) {
    return (
      <Title level={l} style={titleStyle}>
        {t}
      </Title>
    );
  }

  return (
    <ConfigProvider theme={{ token: { fontSize: 12, lineHeight: 10 } }}>
      {expanded ? (
        <>
          <T l={5} t={vermietung.datumForDisplayShort} />
          <T l={3} t={vermietung.kopf.titel + " (Vermietung)"} />
        </>
      ) : (
        <>
          <Title level={4} style={titleStyle}>
            {vermietung.kopf.titel} (Vermietung)
            <br />
            <small>
              <small style={{ fontWeight: 400 }}>{vermietung.startDatumUhrzeit.wochentagTagMonatShort}</small>
            </small>
          </Title>
        </>
      )}
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
      <Col xs={24} sm={12} md={8} xxl={6}>
        <Collapse
          style={{ borderColor: color }}
          size={"small"}
          activeKey={expanded ? vermietung.id : ""}
          onChange={() => {
            setExpanded(!expanded);
          }}
          expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
          items={[
            {
              key: vermietung.id || "",
              style: { backgroundColor: color },
              className: "team-block",
              label: <VermietungHeader vermietung={vermietung} expanded={expanded} />,
              extra: <Extras vermietung={vermietung} />,
              children: (
                <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
                  <div style={{ margin: -12 }}>
                    <Row justify="end">
                      <span>
                        <h3 style={{ marginBlockStart: 4, marginBlockEnd: 0, marginInlineEnd: 8 }}>Vermietung</h3>
                      </span>
                      <ButtonInAdminPanel url={vermietung.url ?? ""} type="allgemeines" isVermietung />
                      {vermietung.brauchtTechnik && <ButtonInAdminPanel url={vermietung.url ?? ""} type="technik" isVermietung />}
                      <ButtonInAdminPanel url={vermietung.url ?? ""} type="ausgaben" isVermietung />
                      {vermietung.brauchtPresse && <ButtonInAdminPanel url={vermietung.url ?? ""} type="presse" isVermietung />}
                    </Row>
                  </div>
                </ConfigProvider>
              ),
            },
          ]}
        />
      </Col>
    </ConfigProvider>
  );
}
