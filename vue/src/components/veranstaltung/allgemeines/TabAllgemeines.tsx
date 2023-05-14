import { Col, FormInstance, Row } from "antd";
import React from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import EventCard from "@/components/veranstaltung/allgemeines/EventCard";
import ArtistCard from "@/components/veranstaltung/allgemeines/ArtistCard";
import KommentarCard from "@/components/veranstaltung/allgemeines/KommentarCard";
import KontaktCard from "@/components/veranstaltung/allgemeines/KontaktCard";
import VertragCard from "@/components/veranstaltung/allgemeines/VertragCard";
import BearbeiterCard from "@/components/veranstaltung/allgemeines/BearbeiterCard";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

interface TabAllgemeinesProps {
  form: FormInstance;
  optionen: OptionValues;
  orte: Orte;
  brauchtHotelCallback: (brauchtHotel: boolean) => void;
  veranstaltung: Veranstaltung;
  titleAndDateCallback: () => void;
}

export default function TabAllgemeines({
  optionen,
  orte,
  form,
  brauchtHotelCallback,
  veranstaltung,
  titleAndDateCallback,
}: TabAllgemeinesProps) {
  return (
    <Row gutter={12}>
      <Col span={12}>
        <EventCard
          form={form}
          optionen={optionen}
          orte={orte}
          brauchtHotelCallback={brauchtHotelCallback}
          titleAndDateCallback={titleAndDateCallback}
        />
        <ArtistCard optionen={optionen} />
        <KommentarCard />
      </Col>
      <Col span={12}>
        <KontaktCard kontakte={optionen.agenturen} form={form} selector="agentur" />
        <VertragCard form={form} veranstaltung={veranstaltung} />
        <BearbeiterCard changelist={form.getFieldsValue(true).changelist} />
      </Col>
    </Row>
  );
}
