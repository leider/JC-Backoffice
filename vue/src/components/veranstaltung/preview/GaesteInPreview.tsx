import Veranstaltung, { GastArt, NameWithNumber } from "jc-shared/veranstaltung/veranstaltung.ts";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung.tsx";
import { List } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { ButtonStaff } from "@/components/team/TeamBlock/ButtonStaff.tsx";
import { updateGastInSection } from "@/commons/loader.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function AddOrRemoveGastButton({
  veranstaltung,
  item,
  art,
  add,
  onChange,
}: {
  veranstaltung: Veranstaltung;
  item: NameWithNumber;
  art: GastArt;
  add: boolean;
  onChange: (veranst: Veranstaltung) => void;
}) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: async ({ item, art }: { item: NameWithNumber; art: GastArt }) => updateGastInSection(veranstaltung, item, art),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung", data.url] });
      onChange(new Veranstaltung(data));
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

export default function GaesteInPreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const [gaesteliste, setGaesteliste] = useState<NameWithNumber[]>([]);
  const [reservierungen, setReservierungen] = useState<NameWithNumber[]>([]);
  useEffect(() => {
    setGaesteliste(veranstaltung.gaesteliste);
    setReservierungen(veranstaltung.reservierungen);
  }, [veranstaltung.gaesteliste, veranstaltung.reservierungen]);

  function listChanged(veranst: Veranstaltung) {
    setGaesteliste(veranst.gaesteliste);
    setReservierungen(veranst.reservierungen);
  }

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
              <AddOrRemoveGastButton item={item} art={art} add={true} veranstaltung={veranstaltung} onChange={listChanged} />,
              <b>{item.alreadyIn}</b>,
              <AddOrRemoveGastButton item={item} art={art} add={false} veranstaltung={veranstaltung} onChange={listChanged} />,
            ]}
          >
            <List.Item.Meta title={`${item.name} (${item.number} Karten)`} description={item.comment} />
          </List.Item>
        )}
      />
    );
  }

  return (
    gaesteliste.length > 0 &&
    reservierungen.length > 0 && (
      <CollapsibleForVeranstaltung suffix="gaeste" label="Gästeliste / Reservierungen">
        {gaesteliste.length > 0 && <GastResList source={gaesteliste} art="gast" />}
        {reservierungen.length > 0 && <GastResList source={reservierungen} art="res" />}
      </CollapsibleForVeranstaltung>
    )
  );
}
