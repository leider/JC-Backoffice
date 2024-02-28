import Konzert, { GastArt, NameWithNumber } from "../../../../../shared/konzert/konzert.ts";
import Collapsible from "@/widgets/Collapsible.tsx";
import { List } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ButtonStaff } from "@/components/team/TeamBlock/ButtonStaff.tsx";
import { updateGastInSection } from "@/commons/loader.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function AddOrRemoveGastButton({
  konzert,
  item,
  art,
  add,
  onChange,
}: {
  konzert: Konzert;
  item: NameWithNumber;
  art: GastArt;
  add: boolean;
  onChange: (konzert: Konzert) => void;
}) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: async ({ item, art }: { item: NameWithNumber; art: GastArt }) => updateGastInSection(konzert, item, art),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["konzert", data.url] });
      onChange(new Konzert(data));
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

export default function GaesteInPreview({ konzert }: { konzert: Konzert }) {
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
              <AddOrRemoveGastButton item={item} art={art} add={true} konzert={konzert} onChange={listChanged} />,
              <b>{item.alreadyIn}</b>,
              <AddOrRemoveGastButton item={item} art={art} add={false} konzert={konzert} onChange={listChanged} />,
            ]}
          >
            <List.Item.Meta title={`${item.name} (${item.number} Karten)`} description={item.comment} />
          </List.Item>
        )}
      />
    );
  }

  return (
    (gaesteliste.length > 0 || reservierungen.length > 0) && (
      <Collapsible suffix="gaeste" label="Gästeliste / Reservierungen">
        {gaesteliste.length > 0 && <GastResList source={gaesteliste} art="gast" />}
        {reservierungen.length > 0 && <GastResList source={reservierungen} art="res" />}
      </Collapsible>
    )
  );
}
