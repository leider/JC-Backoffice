import { Col, Row } from "antd";
import React, { CSSProperties, useEffect, useState } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { PageHeader } from "@ant-design/pro-layout";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung.tsx";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { optionen as optionenRestCall, veranstaltungForUrl } from "@/commons/loader.ts";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import Kontakt from "jc-shared/veranstaltung/kontakt.ts";
import groupBy from "lodash/groupBy";
import StaffInPreview from "@/components/veranstaltung/preview/StaffInPreview.tsx";
import KasseInPreview from "@/components/veranstaltung/preview/KasseInPreview.tsx";
import InfoInPreview from "@/components/veranstaltung/preview/InfoInPreview.tsx";
import TechnikInPreview from "@/components/veranstaltung/preview/TechnikInPreview.tsx";
import GaesteInPreview from "@/components/veranstaltung/preview/GaesteInPreview.tsx";

export default function Preview() {
  const { url } = useParams();
  const veranst = useQuery({
    queryKey: ["veranstaltung", url],
    queryFn: () => veranstaltungForUrl(url || ""),
  });
  const opts = useQuery({ queryKey: ["optionen"], queryFn: optionenRestCall });

  const [veranstaltung, setVeranstaltung] = useState<Veranstaltung>(new Veranstaltung());
  const [typeColor, setTypeColor] = useState<string | undefined>("");

  useEffect(() => {
    if (opts.data && veranstaltung) {
      const typByName = groupBy(opts.data?.typenPlus || [], "name");
      setTypeColor(typByName[veranstaltung.kopf.eventTyp]?.[0].color || "#6c757d");
    }
  }, [opts.data, veranstaltung]);

  useEffect(() => {
    if (veranst.data) {
      setVeranstaltung(veranst.data);
    }
  }, [veranst.data]);

  const titleStyle: CSSProperties = { color: typeColor, whiteSpace: "normal" };
  return (
    <div>
      <PageHeader
        title={
          <span style={titleStyle}>
            {veranstaltung.kopf.titelMitPrefix} {veranstaltung.kopf.presseInEcht}
          </span>
        }
        subTitle={<span style={titleStyle}>{veranstaltung.datumForDisplayShort}</span>}
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