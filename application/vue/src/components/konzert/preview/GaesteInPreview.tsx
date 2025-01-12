import Konzert, { GastArt, NameWithNumber } from "jc-shared/konzert/konzert.ts";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, List, Row } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ButtonStaff } from "@/components/team/TeamBlock/ButtonStaff.tsx";
import { updateGastInSection } from "@/commons/loader.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";

function AddOrRemoveGastButton({ konzert, item, art, add }: { konzert: Konzert; item: NameWithNumber; art: GastArt; add: boolean }) {
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

export default function GaesteInPreview({ konzert, url }: { konzert: Konzert; url?: string }) {
  const [gaesteliste, setGaesteliste] = useState<NameWithNumber[]>([]);
  const [reservierungen, setReservierungen] = useState<NameWithNumber[]>([]);

  const listChanged = useCallback((konz: Konzert) => {
    setGaesteliste(konz.gaesteliste);
    setReservierungen(konz.reservierungen);
  }, []);

  useEffect(() => {
    listChanged(konzert);
  }, [listChanged, konzert]);

  function GastResList({ source, art }: { source: NameWithNumber[]; art: GastArt }) {
    const dataSource = useMemo(() => source.sort((a, b) => a.name.localeCompare(b.name)), [source]);
    return (
      <List
        size="small"
        header={<h2 style={{ margin: 0 }}>{art === "gast" ? "Gästeliste" : "Reservierungen"}</h2>}
        dataSource={dataSource}
        renderItem={(item) => (
          <List.Item
            style={{ paddingLeft: 0, paddingRight: 0 }}
            actions={[
              <AddOrRemoveGastButton key="addGast" item={item} art={art} add={true} konzert={konzert} />,
              <b key="alreadyin">{item.alreadyIn}</b>,
              <AddOrRemoveGastButton key="removeGast" item={item} art={art} add={false} konzert={konzert} />,
            ]}
          >
            <List.Item.Meta title={`${item.name} (${item.number} Karten)`} description={item.comment} />
          </List.Item>
        )}
      />
    );
  }

  function ButtonGaesteliste() {
    const { color, icon } = colorsAndIconsForSections;
    const { currentUser } = useJazzContext();
    if (currentUser.id && !currentUser.accessrights.isAbendkasse) {
      return;
    }
    return (
      <ButtonWithIconAndLink
        alwaysText
        block
        text="Gästeliste Bearbeiten..."
        tooltipTitle="Gästeliste"
        color={color("gaeste")}
        icon={icon("gaeste")}
        to={{
          pathname: `/konzert/${url}`,
          search: "page=gaeste",
        }}
      />
    );
  }

  return (
    <Collapsible suffix="gaeste" label="Gästeliste / Reservierungen">
      <Row gutter={12}>
        <Col span={24}>
          {gaesteliste.length > 0 && <GastResList source={gaesteliste} art="gast" />}
          {reservierungen.length > 0 && <GastResList source={reservierungen} art="res" />}
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={10} offset={14}>
          <ButtonGaesteliste />
        </Col>
      </Row>
    </Collapsible>
  );
}
