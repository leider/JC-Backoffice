import React, { useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form } from "antd";
import Konzert from "jc-shared/konzert/konzert.ts";
import { NumberInput } from "@/widgets/numericInputWidgets";
import SingleSelect from "@/widgets/SingleSelect";
import CheckItem from "@/widgets/CheckItem";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import Kosten from "jc-shared/veranstaltung/kosten.ts";
import Technik from "jc-shared/veranstaltung/technik.ts";
import KonzertKalkulation from "jc-shared/konzert/konzertKalkulation.ts";
import LabelCurrencyRow from "@/widgets/numericInputWidgets/LabelCurrencyRow";
import LabelCurrencyChangeableRow from "@/widgets/numericInputWidgets/LabelCurrencyChangeableRow.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import useAusgaben from "@/components/konzert/kosten/useAusgaben.ts";
import { useWatch } from "antd/es/form/Form";
import useHotelSummierer from "@/components/konzert/hotel/useHotelSummierer.ts";
import useKassenSaldierer from "@/components/konzert/kasse/useKassenSaldierer.ts";

function HotelZeile() {
  const { roomsTotalEUR, transportEUR } = useHotelSummierer();
  const brauchtHotel = useWatch(["artist", "brauchtHotel"], { preserve: true });

  return (
    brauchtHotel && (
      <>
        <JazzRow>
          <Col span={18}>
            <Form.Item>
              <b>Hotel:</b>
            </Form.Item>
          </Col>
          <Col span={6}>
            <NumberInputWithDirectValue decimals={2} suffix="€" value={roomsTotalEUR || 0} />
          </Col>
        </JazzRow>
        <JazzRow>
          <Col span={18}>
            <Form.Item>
              <b>Hotel (Transport):</b>
            </Form.Item>
          </Col>
          <Col span={6}>
            <NumberInputWithDirectValue decimals={2} suffix="€" value={transportEUR || 0} />
          </Col>
        </JazzRow>
      </>
    )
  );
}

function KassenZeile() {
  const { istFreigegeben, ausgabenOhneGage } = useKassenSaldierer();
  return (
    istFreigegeben && (
      <JazzRow>
        <Col span={18}>
          <Form.Item>
            <b>Abendkasse (ohne Gage):</b>
          </Form.Item>
        </Col>
        <Col span={6}>
          <NumberInputWithDirectValue decimals={2} suffix="€" value={ausgabenOhneGage} />
        </Col>
      </JazzRow>
    )
  );
}

const steuerSaetze = ["ohne", "7% MWSt.", "19% MWSt.", "18,8% Ausland"];

export default function AusgabenCard() {
  const form = useFormInstance();
  const summe = useAusgaben();

  const gagenEUR = useWatch(["kosten", "gagenEUR"], { preserve: true });
  const gagenSteuer = useWatch(["kosten", "gagenSteuer"], { preserve: true });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const kosten = useMemo(() => new Kosten(form.getFieldValue("kosten")), [form, gagenEUR, gagenSteuer]);

  const kskAnteil = useMemo(() => gagenEUR * 0.05, [gagenEUR]);

  const einnahmenReservix = useWatch(["kasse", "einnahmenReservix"], { preserve: true });
  const einnahmeTicketsEUR = useWatch(["kasse", "einnahmeTicketsEUR"], { preserve: true });
  const konzertKalkulation = useMemo(
    () => new KonzertKalkulation(new Konzert(form.getFieldsValue(true))),
    [form, einnahmeTicketsEUR, einnahmenReservix], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const { lg } = useBreakpoint();
  return (
    <Collapsible amount={summe} label="Kosten / Ausgaben" noTopBorder={lg} suffix="ausgaben">
      <JazzRow>
        <Col span={6}>
          <NumberInput decimals={2} label="Gagen" name={["kosten", "gagenEUR"]} suffix="€" />
        </Col>
        <Col span={6}>
          <SingleSelect label="Steuer" name={["kosten", "gagenSteuer"]} options={steuerSaetze} />
        </Col>
        <Col span={6}>
          <SingleSelect label="Deal" name={["kosten", "deal"]} options={Kosten.deals} />
        </Col>
        <Col span={6}>
          <NumberInputWithDirectValue decimals={2} label="Total" suffix="€" value={kosten.gagenTotalEUR} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col sm={12} xs={24}>
          <NumberInputWithDirectValue decimals={2} label="KSK (auf Gagen netto ohne Deal)" suffix="€" value={kskAnteil} />
        </Col>
        <Col sm={12} xs={24}>
          <NumberInputWithDirectValue decimals={2} label="GEMA (auf Eintritt und Reservix)" suffix="€" value={konzertKalkulation.gema} />
        </Col>
      </JazzRow>
      <LabelCurrencyRow label="Provision Agentur" path={["kosten", "provisionAgentur"]} />
      {new Technik(form.getFieldValue("technik")).fluegel ? (
        <LabelCurrencyRow label="Flügelstimmer" path={["kosten", "fluegelstimmerEUR"]} />
      ) : null}
      <LabelCurrencyChangeableRow label="Werbung 1" path={["kosten", "werbung1"]} />
      <LabelCurrencyChangeableRow label="Werbung 2" path={["kosten", "werbung2"]} />
      <LabelCurrencyChangeableRow label="Werbung 3" path={["kosten", "werbung3"]} />
      <LabelCurrencyRow label="Catering Musiker (unbar)" path={["kosten", "cateringMusiker"]} />
      <LabelCurrencyRow label="Catering Personal (unbar)" path={["kosten", "cateringPersonal"]} />
      <LabelCurrencyRow label="Personal (unbar)" path={["kosten", "personal"]} />
      <LabelCurrencyRow label="Tontechniker (unbar)" path={["kosten", "tontechniker"]} />
      <LabelCurrencyRow label="Lichttechniker (unbar)" path={["kosten", "lichttechniker"]} />
      <KassenZeile />
      <HotelZeile />
      <JazzRow>
        <CheckItem label="Gage in BAR an der Abendkasse" name={["kosten", "gageBAR"]} />
      </JazzRow>
      <LabelCurrencyRow disabled label="Backline Rockshop" path={["kosten", "backlineEUR"]} />
      <LabelCurrencyRow disabled label="Technik Zumietung" path={["kosten", "technikAngebot1EUR"]} />
      <LabelCurrencyRow disabled label="Saalmiete" path={["kosten", "saalmiete"]} />
    </Collapsible>
  );
}
