import React, { useMemo } from "react";
import { ConfigProvider } from "antd";
import headerTags from "@/components/colored/headerTags.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

export function TeamBlockAdminExtras({ veranstaltung }: { readonly veranstaltung: Veranstaltung }) {
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
