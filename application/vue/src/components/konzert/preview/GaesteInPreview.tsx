import Konzert, { GastArt, NameWithNumber } from "jc-shared/konzert/konzert.ts";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, List, Typography } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ButtonStaff } from "@/components/team/TeamBlock/ButtonStaff.tsx";
import { updateGastInSection } from "@/commons/loader.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import { JazzRow } from "@/widgets/JazzRow";

function AddOrRemoveGastButton({
  konzert,
  item,
  art,
  add,
}: {
  readonly konzert: Konzert;
  readonly item: NameWithNumber;
  readonly art: GastArt;
  readonly add: boolean;
}) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: async ({ item, art }: { item: NameWithNumber; art: GastArt }) => updateGastInSection(konzert, item, art),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["konzert", data.url] });
    },
  });

  return (
    <ButtonStaff
      add={add}
      callback={() => {
        add ? item.alreadyIn++ : item.alreadyIn--;
        mutate.mutate({ item, art });
      }}
      disabled={add ? item.alreadyIn >= item.number : item.alreadyIn <= 0}
    />
  );
}

function GastResList({ source, art, konzert }: { readonly konzert: Konzert; readonly source: NameWithNumber[]; readonly art: GastArt }) {
  const dataSource = useMemo(() => source.sort((a, b) => a.name.localeCompare(b.name)), [source]);
  return (
    <List
      dataSource={dataSource}
      header={
        <Typography.Title level={3} style={{ margin: 0 }}>
          {art === "gast" ? "Gästeliste" : "Reservierungen"}
        </Typography.Title>
      }
      renderItem={(item) => (
        <List.Item
          actions={[
            <AddOrRemoveGastButton add art={art} item={item} key="addGast" konzert={konzert} />,
            <b key="alreadyin">{item.alreadyIn}</b>,
            <AddOrRemoveGastButton add={false} art={art} item={item} key="removeGast" konzert={konzert} />,
          ]}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <List.Item.Meta description={item.comment} title={`${item.name} (${item.number} Karten)`} />
        </List.Item>
      )}
      size="small"
    />
  );
}

function ButtonGaesteliste({ url = "" }: { readonly url?: string }) {
  const { color, icon } = colorsAndIconsForSections;
  const { currentUser } = useJazzContext();
  if (currentUser.id && !currentUser.accessrights.isAbendkasse) {
    return;
  }
  return (
    <ButtonWithIconAndLink
      alwaysText
      block
      color={color("gaeste")}
      icon={icon("gaeste")}
      text="Liste Bearbeiten..."
      to={{
        pathname: `/konzert/${url}`,
        search: "page=gaeste",
      }}
      tooltipTitle="Gästeliste"
    />
  );
}

export default function GaesteInPreview({ konzert, url }: { readonly konzert: Konzert; readonly url?: string }) {
  const [gaesteliste, setGaesteliste] = useState<NameWithNumber[]>([]);
  const [reservierungen, setReservierungen] = useState<NameWithNumber[]>([]);

  const listChanged = useCallback((konz: Konzert) => {
    setGaesteliste(konz.gaesteliste);
    setReservierungen(konz.reservierungen);
  }, []);

  useEffect(() => {
    listChanged(konzert);
  }, [listChanged, konzert]);

  return (
    <Collapsible label="Gästeliste / Reservierungen" suffix="gaeste">
      <JazzRow>
        <Col span={24}>
          {gaesteliste.length > 0 && <GastResList art="gast" konzert={konzert} source={gaesteliste} />}
          {reservierungen.length > 0 && <GastResList art="res" konzert={konzert} source={reservierungen} />}
        </Col>
      </JazzRow>
      <JazzRow>
        <Col offset={14} span={10}>
          <ButtonGaesteliste url={url} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
