import { Col } from "antd";
import React, { useEffect, useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { vermietungForUrl } from "@/rest/loader.ts";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import StaffInPreview from "@/components/veranstaltung/preview/StaffInPreview.tsx";
import InfoInPreview from "@/components/veranstaltung/preview/InfoInPreview.tsx";
import TechnikInPreview from "@/components/veranstaltung/preview/TechnikInPreview.tsx";
import { ButtonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";

function EditButton({ url = "" }: { readonly url?: string }) {
  const type: ButtonType = "allgemeines";
  const { color, icon } = colorsAndIconsForSections;
  return (
    <ButtonWithIconAndLink
      color={color(type)}
      icon={icon(type)}
      text="Bearbeiten..."
      to={`/vermietung/${encodeURIComponent(url)}?page=${type}`}
    />
  );
}

export default function PreviewVermietung() {
  const { url } = useParams();
  const { data } = useQuery({
    queryKey: ["vermietung", url],
    queryFn: () => vermietungForUrl(url || ""),
  });
  const { currentUser, setMemoizedVeranstaltung } = useJazzContext();

  const vermietung = useMemo(() => (data ? data : new Vermietung()), [data]);

  document.title = vermietung.kopf.titelMitPrefix;

  useEffect(() => {
    setMemoizedVeranstaltung({ veranstaltung: vermietung, highlight: true });
  }, [vermietung, setMemoizedVeranstaltung]);

  return (
    <div>
      <JazzPageHeader
        buttons={[currentUser.accessrights.isOrgaTeam && <EditButton key="edit" url={url} />]}
        dateString={vermietung.datumForDisplayShort}
        title={`${vermietung.kopf.titelMitPrefix} ${vermietung.kopf.presseInEcht}`}
      />
      <JazzRow>
        <Col lg={12} xs={24}>
          <StaffInPreview veranstaltung={vermietung} />
          <InfoInPreview veranstaltung={vermietung} />
          <TechnikInPreview veranstaltung={vermietung} />
        </Col>
        {vermietung.brauchtPresse ? (
          <Col lg={12} xs={24}>
            <Collapsible label="Pressetext" suffix="presse">
              <PressePreview veranstaltung={vermietung} />
            </Collapsible>
          </Col>
        ) : null}
      </JazzRow>
    </div>
  );
}
