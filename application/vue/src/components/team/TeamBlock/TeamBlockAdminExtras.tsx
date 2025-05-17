import React, { useMemo } from "react";
import { ConfigProvider } from "antd";
import headerTags from "@/components/colored/headerTags.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import createTaggies from "@/components/team/TeamBlock/createTaggies.ts";

export function TeamBlockAdminExtras({ veranstaltung }: { readonly veranstaltung: Veranstaltung }) {
  const taggies = createTaggies(veranstaltung);
  const tagsForTitle = useMemo(() => {
    return headerTags(taggies, true);
  }, [taggies]);

  return (
    <ConfigProvider theme={{ token: { fontSize: 11 } }}>
      <div style={{ width: "70px" }}>{tagsForTitle}</div>
    </ConfigProvider>
  );
}
