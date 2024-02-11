import { Col, Row } from "antd";
import React, { CSSProperties, useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung.tsx";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { veranstaltungForUrl } from "@/commons/loader.ts";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import Kontakt from "jc-shared/veranstaltung/kontakt.ts";
import groupBy from "lodash/groupBy";
import StaffInPreview from "@/components/veranstaltung/preview/StaffInPreview.tsx";
import KasseInPreview from "@/components/veranstaltung/preview/KasseInPreview.tsx";
import InfoInPreview from "@/components/veranstaltung/preview/InfoInPreview.tsx";
import TechnikInPreview from "@/components/veranstaltung/preview/TechnikInPreview.tsx";
import GaesteInPreview from "@/components/veranstaltung/preview/GaesteInPreview.tsx";
import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";

export default function Preview() {
  const { url } = useParams();
  const veranst = useQuery({
    queryKey: ["veranstaltung", url],
    queryFn: () => veranstaltungForUrl(url || ""),
  });
  const { currentUser, optionen } = useJazzContext();

  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung());
  const [typeColor, setTypeColor] = useState<string | undefined>("");

  document.title = veranstaltung.kopf.titelMitPrefix;

  useEffect(() => {
    if (optionen && veranstaltung) {
      const typByName = groupBy(optionen.typenPlus || [], "name");
      setTypeColor(typByName[veranstaltung.kopf.eventTyp]?.[0].color || "#6c757d");
    }
  }, [optionen, veranstaltung]);

  useEffect(() => {
    if (veranst.data) {
      setVeranstaltung(veranst.data);
    }
  }, [veranst.data]);

  function EditButton() {
    const type: buttonType = "allgemeines";
    const { color, icon } = colorsAndIconsForSections;
    return (
      <ButtonWithIconAndLink
        icon={icon(type)}
        to={`/veranstaltung/${encodeURIComponent(url ?? "")}?page=${type}`}
        color={color(type)}
        text="Bearbeiten..."
      />
    );
  }

  const titleStyle: CSSProperties = { color: typeColor };
  return (
    <div>
      <JazzPageHeader
        title={
          <span style={titleStyle}>
            {veranstaltung.kopf.titelMitPrefix} {veranstaltung.kopf.presseInEcht}
          </span>
        }
        dateString={veranstaltung.datumForDisplayShort}
        buttons={[currentUser.accessrights.isOrgaTeam && <EditButton key="edit" />]}
      />
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <GaesteInPreview veranstaltung={veranstaltung} />
          <StaffInPreview veranstaltung={veranstaltung} />
          <KasseInPreview veranstaltung={veranstaltung} url={url} />
          <InfoInPreview veranstaltung={veranstaltung} />
          <TechnikInPreview veranstaltung={veranstaltung} />
        </Col>
        <Col xs={24} lg={12}>
          <CollapsibleForVeranstaltung suffix="presse" label="Pressetext">
            <PressePreview veranstVermiet={veranstaltung} />
          </CollapsibleForVeranstaltung>
          {veranstaltung.agentur.name && (
            <CollapsibleForVeranstaltung suffix="allgemeines" label="Agentur">
              <AddressBlock kontakt={veranstaltung.agentur} />
            </CollapsibleForVeranstaltung>
          )}
          {veranstaltung.artist.brauchtHotel && veranstaltung.unterkunft.anzahlZimmer > 0 && (
            <CollapsibleForVeranstaltung
              suffix="hotel"
              label={`Hotel: ${veranstaltung.unterkunft.anzahlZimmer} Zimmer für ${veranstaltung.unterkunft.anzNacht}`}
            >
              <AddressBlock kontakt={veranstaltung.hotel} />
            </CollapsibleForVeranstaltung>
          )}
        </Col>
      </Row>
    </div>
  );
}

function AddressBlock({ kontakt }: { kontakt: Kontakt }) {
  const lines = kontakt.adresse.match(/[^\r\n]+/g) || [];
  return (
    <address>
      <strong>{kontakt.name}</strong>
      <br />
      {lines.map((line) => (
        <span key={line}>
          {line} <br />
        </span>
      ))}
      Tel.: <a href={`tel:${kontakt.telefon}`}> {kontakt.telefon}</a>
      <br />
      E-Mail: <a href={`mailto:${kontakt.email}`}> {kontakt.email}</a>
    </address>
  );
}
