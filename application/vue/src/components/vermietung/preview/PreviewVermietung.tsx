import { Col } from "antd";
import React, { useEffect, useMemo } from "react";
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
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function PreviewVermietung() {
  const { url } = useParams();
  const { data } = useQuery({
    queryKey: ["vermietung", url],
    queryFn: () => vermietungForUrl(url || ""),
  });
  const { currentUser, setMemoizedId } = useJazzContext();

  const vermietung = useMemo(() => (data ? data : new Vermietung()), [data]);

  document.title = vermietung.kopf.titelMitPrefix;

  useEffect(() => {
    setMemoizedId(vermietung.id);
  }, [vermietung.id, setMemoizedId]);

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
      <JazzRow>
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
      </JazzRow>
    </div>
  );
}
