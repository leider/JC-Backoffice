import { Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { vermietungForUrl } from "@/commons/loader.ts";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import StaffInPreview from "@/components/veranstaltung/preview/StaffInPreview.tsx";
import InfoInPreview from "@/components/veranstaltung/preview/InfoInPreview.tsx";
import TechnikInPreview from "@/components/veranstaltung/preview/TechnikInPreview.tsx";
import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

export default function PreviewVermietung() {
  const { url } = useParams();
  const vermietungQueryData = useQuery({
    queryKey: ["vermietung", url],
    queryFn: () => vermietungForUrl(url || ""),
  });
  const { currentUser } = useJazzContext();

  const [vermietung, setVermietung] = useState<Vermietung>(new Vermietung());

  document.title = vermietung.kopf.titelMitPrefix;

  useEffect(() => {
    if (vermietungQueryData.data) {
      setVermietung(vermietungQueryData.data);
    }
  }, [vermietungQueryData.data]);

  function EditButton() {
    const type: buttonType = "allgemeines";
    const { color, icon } = colorsAndIconsForSections;
    return (
      <ButtonWithIconAndLink
        icon={icon(type)}
        to={`/vermietung/${encodeURIComponent(url ?? "")}?page=${type}`}
        color={color(type)}
        text="Bearbeiten..."
      />
    );
  }

  return (
    <div>
      <JazzPageHeader
        title={`${vermietung.kopf.titelMitPrefix} ${vermietung.kopf.presseInEcht}`}
        dateString={vermietung.datumForDisplayShort}
        buttons={[currentUser.accessrights.isOrgaTeam && <EditButton key="edit" />]}
      />
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <StaffInPreview veranstaltung={vermietung} />
          <InfoInPreview veranstaltung={vermietung} />
          <TechnikInPreview veranstaltung={vermietung} />
        </Col>
        {vermietung.brauchtPresse && (
          <Col xs={24} lg={12}>
            <Collapsible suffix="presse" label="Pressetext">
              <PressePreview veranstaltung={vermietung} />
            </Collapsible>
          </Col>
        )}
      </Row>
    </div>
  );
}
