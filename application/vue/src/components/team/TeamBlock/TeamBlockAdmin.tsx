import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Collapse, ConfigProvider } from "antd";
import TeamBlockHeader from "@/components/team/TeamBlock/TeamBlockHeader.tsx";
import headerTags from "@/components/colored/headerTags.tsx";
import AdminContent from "@/components/team/TeamBlock/AdminContent.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { expandIcon } from "@/widgets/collapseExpandIcon.tsx";
import { ButtonPreview } from "@/components/team/TeamBlock/ButtonPreview.tsx";

function Extras({ veranstaltung }: { readonly veranstaltung: Veranstaltung }) {
  const tagsForTitle = useMemo(() => {
    const confirmed = veranstaltung.kopf.confirmed;
    const technikOK = veranstaltung.technik.checked;
    const presseOK = veranstaltung.presse.checked;
    const homepage = veranstaltung.kopf.kannAufHomePage;
    const social = veranstaltung.kopf.kannInSocialMedia;
    const abgesagt = veranstaltung.kopf.abgesagt;
    const brauchtHotel = veranstaltung.artist.brauchtHotel;

    const taggies: { label: string; color: boolean }[] = [{ label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed }];
    if (!veranstaltung.isVermietung || (veranstaltung as Vermietung).brauchtTechnik) {
      taggies.push({ label: "Technik", color: technikOK });
    }
    if (veranstaltung.brauchtPresse) {
      taggies.push({ label: "Presse", color: presseOK });
    }
    taggies.push({ label: "Homepage", color: homepage }, { label: "Social Media", color: social });
    if (veranstaltung.isVermietung && (veranstaltung as Vermietung).brauchtBar) {
      taggies.push({ label: "Bar einladen", color: (veranstaltung as Vermietung).brauchtBar });
    }
    if (abgesagt) {
      taggies.unshift({ label: "ABGESAGT", color: false });
    }
    if (!veranstaltung.isVermietung && brauchtHotel) {
      taggies.push({ label: "Hotel", color: (veranstaltung as Konzert).unterkunft.bestaetigt });
    }
    return headerTags(taggies, true);
  }, [veranstaltung]);

  return (
    <ConfigProvider theme={{ token: { fontSize: 11 } }}>
      <div style={{ width: "70px" }}>{tagsForTitle}</div>
    </ConfigProvider>
  );
}

export default function TeamBlockAdmin({
  veranstaltung,
  initiallyOpen,
}: {
  readonly veranstaltung: Veranstaltung;
  readonly initiallyOpen: boolean;
}) {
  const { memoizedId, isDarkMode } = useJazzContext();
  const highlight = useMemo(() => veranstaltung.id === memoizedId, [memoizedId, veranstaltung.id]);
  const [expanded, setExpanded] = useState<boolean>(initiallyOpen || highlight);
  useEffect(() => {
    setExpanded(initiallyOpen || highlight);
  }, [highlight, initiallyOpen]);

  const textColor = useMemo(() => veranstaltung.colorText(isDarkMode), [isDarkMode, veranstaltung]);
  const onChange = useCallback(() => setExpanded(!expanded), [expanded]);

  return (
    <ConfigProvider theme={{ token: { fontSizeIcon: expanded ? 18 : 14 } }}>
      <Col id={veranstaltung.id} span={24} style={highlight ? { border: "solid 4px" } : undefined}>
        {veranstaltung.ghost ? (
          <div style={{ backgroundColor: veranstaltung.color, padding: "2px 16px" }}>
            <TeamBlockHeader veranstaltung={veranstaltung} />
          </div>
        ) : (
          <Collapse
            activeKey={expanded ? veranstaltung.id : undefined}
            expandIcon={expandIcon({ color: textColor })}
            items={[
              {
                key: veranstaltung.id ?? "",
                style: { backgroundColor: veranstaltung.color },
                className: "team-block",
                label: <TeamBlockHeader veranstaltung={veranstaltung} />,
                extra: expanded ? <Extras veranstaltung={veranstaltung} /> : <ButtonPreview veranstaltung={veranstaltung} />,
                children: (
                  <ConfigProvider theme={{ token: { fontSizeIcon: 10 } }}>
                    <AdminContent veranstaltung={veranstaltung} />
                  </ConfigProvider>
                ),
              },
            ]}
            onChange={onChange}
            size="small"
            style={{ borderColor: veranstaltung.color }}
          />
        )}
      </Col>
    </ConfigProvider>
  );
}
