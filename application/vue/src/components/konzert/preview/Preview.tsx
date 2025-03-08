import { Col } from "antd";
import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { konzertWithRiderForUrl } from "@/commons/loader.ts";
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
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow";
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";

export default function Preview() {
  const { url } = useParams();
  const { data } = useQuery({
    queryKey: ["konzert", url],
    queryFn: () => konzertWithRiderForUrl(url || ""),
  });
  const { currentUser, optionen, setMemoizedId } = useJazzContext();

  const konzert = useMemo(() => (data ? data : new KonzertWithRiderBoxes()), [data]);

  useEffect(() => {
    setMemoizedId(konzert.id);
  }, [konzert.id, setMemoizedId]);

  const [typeColor, setTypeColor] = useState<string | undefined>("");

  document.title = konzert.kopf.titelMitPrefix;

  useEffect(() => {
    if (optionen && konzert) {
      const typByName = groupBy(optionen.typenPlus ?? [], "name");
      setTypeColor(typByName[konzert.kopf.eventTyp]?.[0].color ?? colorDefault);
    }
  }, [optionen, konzert]);

  function EditButton() {
    const type: buttonType = "allgemeines";
    const { color, icon } = colorsAndIconsForSections;
    return (
      <ButtonWithIconAndLink
        color={color(type)}
        icon={icon(type)}
        text="Bearbeiten..."
        to={`/konzert/${encodeURIComponent(url ?? "")}?page=${type}`}
      />
    );
  }

  const titleStyle: CSSProperties = { color: typeColor, textDecoration: konzert.kopf.abgesagt ? "line-through" : "" };
  return (
    <>
      <JazzPageHeader
        buttons={[currentUser.accessrights.isOrgaTeam && <EditButton key="edit" />]}
        dateString={konzert.datumForDisplayShort}
        style={titleStyle}
        title={`${konzert.kopf.titel} ${konzert.kopf.presseInEcht}`}
      />
      <JazzRow>
        <Col lg={12} xs={24}>
          <GaesteInPreview konzert={konzert} url={url} />
          <StaffInPreview veranstaltung={konzert} />
          <KasseInPreview konzert={konzert} url={url} />
          <InfoInPreview veranstaltung={konzert} />
          <TechnikInPreview veranstaltung={konzert} />
        </Col>
        <Col lg={12} xs={24}>
          <Collapsible label="Pressetext" suffix="presse">
            <PressePreview veranstaltung={konzert} />
          </Collapsible>
          {konzert.agentur.name && (
            <Collapsible label="Agentur" suffix="allgemeines">
              <AddressBlock kontakt={konzert.agentur} />
            </Collapsible>
          )}
          {konzert.artist.brauchtHotel && konzert.unterkunft.anzahlZimmer > 0 && (
            <Collapsible label={`Hotel: ${konzert.unterkunft.anzahlZimmer} Zimmer für ${konzert.unterkunft.anzNacht}`} suffix="hotel">
              <AddressBlock kontakt={konzert.hotel} />
            </Collapsible>
          )}
        </Col>
      </JazzRow>
    </>
  );
}

function AddressBlock({ kontakt }: { kontakt: Kontakt }) {
  const lines: string[] = kontakt.adresse.match(/[^\r\n]+/g) || [];
  return (
    <address>
      <strong>{kontakt.name}</strong>
      <br />
      {map(lines, (line) => (
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
