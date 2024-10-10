import * as React from "react";
import { CSSProperties, useContext, useEffect, useMemo, useState } from "react";
import { Form } from "antd";
import { useSearchParams } from "react-router-dom";
import { HelpWithKasseButton, MoreButton, SaveButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { KonzertContext } from "@/components/konzert/KonzertComp";
import headerTags from "@/components/colored/headerTags.tsx";
import groupBy from "lodash/groupBy";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";

export default function KonzertPageHeader({ isNew, dirty }: { isNew: boolean; dirty: boolean }) {
  const konzertContext = useContext(KonzertContext);
  const { optionen } = useJazzContext();
  const form = konzertContext!.form;
  const [search] = useSearchParams();
  const { currentUser } = useJazzContext();
  const [displayDate, setDisplayDate] = useState<string>("");
  const [tagsForTitle, setTagsForTitle] = useState<React.ReactElement[]>([]);

  const [isOrga, setIsOrga] = useState<boolean>(false);

  const isKassenseite = useMemo(() => search.get("page") === "kasse", [search]);

  const eventTyp = Form.useWatch(["kopf", "eventTyp"], {
    form,
    preserve: true,
  });

  const typeColor = useMemo(() => {
    const typByName = groupBy(optionen?.typenPlus || [], "name");
    return typByName[eventTyp]?.[0].color || "#6c757d";
  }, [optionen, eventTyp]);

  const titel = Form.useWatch(["kopf", "titel"], { form, preserve: true });
  const startDate = Form.useWatch(["startAndEnd", "start"], {
    form,
    preserve: true,
  });
  const confirmed = Form.useWatch(["kopf", "confirmed"], {
    form,
    preserve: true,
  });
  const abgesagt = Form.useWatch(["kopf", "abgesagt"], {
    form,
    preserve: true,
  });
  const technikOK = Form.useWatch(["technik", "checked"], {
    form,
    preserve: true,
  });
  const brauchtPresse = Form.useWatch("brauchtPresse", {
    form,
    preserve: true,
  });
  const presseOK = Form.useWatch(["presse", "checked"], {
    form,
    preserve: true,
  });
  const homepage = Form.useWatch(["kopf", "kannAufHomePage"], {
    form,
    preserve: true,
  });
  const social = Form.useWatch(["kopf", "kannInSocialMedia"], {
    form,
    preserve: true,
  });
  const brauchtHotel = Form.useWatch(["artist", "brauchtHotel"], {
    form,
    preserve: true,
  });
  const hotel = Form.useWatch(["unterkunft", "bestaetigt"], {
    form,
    preserve: true,
  });

  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const tempTitle = isNew ? "Neue oder kopierte Veranstaltung" : titel || "";
    setTitle(tempTitle);
    document.title = tempTitle;
    setDisplayDate(DatumUhrzeit.forJSDate(startDate?.toDate()).lesbareKurzform);
  }, [isNew, eventTyp, titel, startDate]);

  useEffect(() => {
    const taggies: { label: string; color: boolean }[] = [
      { label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed },
      { label: "Technik", color: technikOK },
    ];
    if (brauchtPresse) {
      taggies.push({ label: "Presse", color: presseOK });
    }
    taggies.push({ label: "Homepage", color: homepage }, { label: "Social Media", color: social });
    if (abgesagt) {
      taggies.unshift({ label: "ABGESAGT", color: false });
    }
    if (brauchtHotel) {
      taggies.push({ label: "Hotel", color: hotel });
    }
    setTagsForTitle(headerTags(taggies));
  }, [confirmed, abgesagt, technikOK, presseOK, homepage, social, brauchtHotel, hotel, brauchtPresse]);

  useEffect(() => {
    setIsOrga(currentUser.accessrights.isOrgaTeam);
  }, [currentUser.accessrights.isOrgaTeam, setIsOrga]);

  const titleStyle: CSSProperties = { color: typeColor };
  return (
    <JazzPageHeader
      title={<span style={titleStyle}>{title}</span>}
      dateString={displayDate}
      buttons={[
        isOrga && <MoreButton key="more" disabled={isNew} />,
        <SaveButton key="save" disabled={!dirty} />,
        isKassenseite && (
          <HelpWithKasseButton
            key="helpKasse"
            callback={() => {
              konzertContext ? konzertContext.setKasseHelpOpen(true) : undefined;
            }}
          />
        ),
        <TeamCalendar key="cal" />,
      ]}
      tags={tagsForTitle}
    >
      {isNew && (
        <b
          style={{
            color: "#d50f36",
          }}
        >
          (Denk daran, alle Felder zu überprüfen und auszufüllen)
        </b>
      )}
    </JazzPageHeader>
  );
}
