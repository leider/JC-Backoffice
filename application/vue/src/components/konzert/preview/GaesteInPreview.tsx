import Konzert, { GastArt, NameWithNumber } from "jc-shared/konzert/konzert.ts";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Drawer, List, Typography } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ButtonStaff } from "@/components/team/TeamBlock/ButtonStaff.tsx";
import { saveKonzert, updateGastInSection } from "@/rest/loader.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzRow } from "@/widgets/JazzRow";
import sortBy from "lodash/sortBy";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import TabGaeste from "@/components/konzert/gaeste/TabGaeste.tsx";
import { useForm } from "antd/es/form/Form";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";

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
  const dataSource = useMemo(() => sortBy(source, "name"), [source]);
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

export default function GaesteInPreview({ konzert, refetch }: { readonly konzert: Konzert; readonly refetch?: () => Promise<unknown> }) {
  const { currentUser, isDirty } = useJazzContext();
  const [gaesteliste, setGaesteliste] = useState<NameWithNumber[]>([]);
  const [reservierungen, setReservierungen] = useState<NameWithNumber[]>([]);
  const { color, icon } = colorsAndIconsForSections;

  const listChanged = useCallback((konz: Konzert) => {
    setGaesteliste(konz.gaesteliste);
    setReservierungen(konz.reservierungen);
  }, []);

  useEffect(() => {
    listChanged(konzert);
  }, [listChanged, konzert]);

  const [open, setOpen] = useState(false);
  const [form] = useForm();
  useEffect(() => {
    form.setFieldsValue(konzert);
  }, [form, konzert]);

  const mutateKonzert = useJazzMutation<Konzert>({
    saveFunction: saveKonzert,
    queryKey: "konzert",
    successMessage: "Das Konzert wurde gespeichert",
  });

  function saveForm(konz: Konzert) {
    mutateKonzert.mutate(konz);
  }

  const canEdit = useMemo(
    () => currentUser.id && !currentUser.accessrights.isAbendkasse,
    [currentUser.accessrights.isAbendkasse, currentUser.id],
  );
  return (
    <Collapsible label="Gästeliste / Reservierungen" suffix="gaeste">
      <Drawer
        closable={!isDirty}
        closeIcon={<div>Schließen</div>}
        getContainer={false}
        maskClosable={!isDirty}
        onClose={() => setOpen(false)}
        open={open}
        placement="top"
        size="large"
      >
        <JazzFormAndHeader<Konzert> data={konzert} resetChanges={refetch} saveForm={saveForm} title="Gästeliste bearbeiten">
          <TabGaeste inModal />
        </JazzFormAndHeader>
      </Drawer>
      <JazzRow>
        <Col span={24}>
          {gaesteliste.length > 0 && <GastResList art="gast" konzert={konzert} source={gaesteliste} />}
          {reservierungen.length > 0 && <GastResList art="res" konzert={konzert} source={reservierungen} />}
        </Col>
      </JazzRow>
      {canEdit ? (
        <JazzRow>
          <Col offset={14} span={10}>
            <ButtonWithIcon
              alwaysText
              block
              color={color("gaeste")}
              icon={icon("gaeste")}
              onClick={() => setOpen(true)}
              text="Liste Bearbeiten..."
              tooltipTitle="Gästeliste"
            />
          </Col>
        </JazzRow>
      ) : null}
    </Collapsible>
  );
}
