import { Col, Row } from "antd";
import React, { CSSProperties, useEffect, useState } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import Collapsible from "@/widgets/Collapsible.tsx";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { konzertForUrl } from "@/commons/loader.ts";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import groupBy from "lodash/groupBy";
import StaffInPreview from "@/components/veranstaltung/preview/StaffInPreview.tsx";
import KasseInPreview from "@/components/konzert/preview/KasseInPreview.tsx";
import InfoInPreview from "@/components/veranstaltung/preview/InfoInPreview.tsx";
import TechnikInPreview from "@/components/veranstaltung/preview/TechnikInPreview.tsx";
import GaesteInPreview from "@/components/konzert/preview/GaesteInPreview.tsx";
import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import Kontakt from "jc-shared/veranstaltung/kontakt.ts";
import { colorDefault } from "jc-shared/optionen/optionValues.ts";

export default function Preview() {
  const { url } = useParams();
  const konzertQueryData = useQuery({
    queryKey: ["konzert", url],
    queryFn: () => konzertForUrl(url || ""),
  });
  const { currentUser, optionen } = useJazzContext();

  const [konzert, setKonzert] = useState<Konzert>(new Konzert());
  const [typeColor, setTypeColor] = useState<string | undefined>("");

  document.title = konzert.kopf.titelMitPrefix;

  useEffect(() => {
    if (optionen && konzert) {
      const typByName = groupBy(optionen.typenPlus ?? [], "name");
      setTypeColor(typByName[konzert.kopf.eventTyp]?.[0].color ?? colorDefault);
    }
  }, [optionen, konzert]);

  useEffect(() => {
    if (konzertQueryData.data) {
      setKonzert(konzertQueryData.data);
    }
  }, [konzertQueryData.data]);

  function EditButton() {
    const type: buttonType = "allgemeines";
    const { color, icon } = colorsAndIconsForSections;
    return (
      <ButtonWithIconAndLink
        icon={icon(type)}
        to={`/konzert/${encodeURIComponent(url ?? "")}?page=${type}`}
        color={color(type)}
        text="Bearbeiten..."
      />
    );
  }

  const titleStyle: CSSProperties = { color: typeColor, textDecoration: konzert.kopf.abgesagt ? "line-through" : "" };
  return (
    <div>
      <JazzPageHeader
        title={
          <span style={titleStyle}>
            {konzert.kopf.titel} {konzert.kopf.presseInEcht}
          </span>
        }
        dateString={konzert.datumForDisplayShort}
        buttons={[currentUser.accessrights.isOrgaTeam && <EditButton key="edit" />]}
      />
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <GaesteInPreview konzert={konzert} url={url} />
          <StaffInPreview veranstaltung={konzert} />
          <KasseInPreview konzert={konzert} url={url} />
          <InfoInPreview veranstaltung={konzert} />
          <TechnikInPreview veranstaltung={konzert} />
        </Col>
        <Col xs={24} lg={12}>
          <Collapsible suffix="presse" label="Pressetext">
            <PressePreview veranstaltung={konzert} />
          </Collapsible>
          {konzert.agentur.name && (
            <Collapsible suffix="allgemeines" label="Agentur">
              <AddressBlock kontakt={konzert.agentur} />
            </Collapsible>
          )}
          {konzert.artist.brauchtHotel && konzert.unterkunft.anzahlZimmer > 0 && (
            <Collapsible suffix="hotel" label={`Hotel: ${konzert.unterkunft.anzahlZimmer} Zimmer für ${konzert.unterkunft.anzNacht}`}>
              <AddressBlock kontakt={konzert.hotel} />
            </Collapsible>
          )}
        </Col>
      </Row>
    </div>
  );
}

function AddressBlock({ kontakt }: { kontakt: Kontakt }) {
  const lines: string[] = kontakt.adresse.match(/[^\r\n]+/g) || [];
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
