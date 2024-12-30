import React, { useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form, Row } from "antd";
import Konzert from "jc-shared/konzert/konzert.ts";
import { NumberInput } from "@/widgets/numericInputWidgets";
import SingleSelect from "@/widgets/SingleSelect";
import { DynamicItem } from "@/widgets/DynamicItem";
import Kasse from "jc-shared/konzert/kasse";
import CheckItem from "@/widgets/CheckItem";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import Kosten from "jc-shared/veranstaltung/kosten.ts";
import Technik from "jc-shared/veranstaltung/technik.ts";
import KonzertKalkulation from "jc-shared/konzert/konzertKalkulation.ts";
import LabelCurrencyRow from "@/widgets/numericInputWidgets/LabelCurrencyRow";
import LabelCurrencyChangeableRow from "@/widgets/numericInputWidgets/LabelCurrencyChangeableRow.tsx";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";

interface AusgabenCardParams {
  onChange: (sum: number) => void;
}
export default function AusgabenCard({ onChange }: AusgabenCardParams) {
  const form = useFormInstance();

  const [summe, setSumme] = useState<number>(0);

  const unterkunft = useWatch(["unterkunft"], { form, preserve: true });
  const brauchtHotel = useWatch(["artist", "brauchtHotel"], { form, preserve: true });
  const backlineEUR = useWatch(["kosten", "backlineEUR"], { form, preserve: true });
  const technikAngebot1EUR = useWatch(["kosten", "technikAngebot1EUR"], { form, preserve: true });
  const fluegelstimmerEUR = useWatch(["kosten", "fluegelstimmerEUR"], { form, preserve: true });

  useEffect(
    updateSumme, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, unterkunft, brauchtHotel, backlineEUR, technikAngebot1EUR, fluegelstimmerEUR],
  );

  function updateSumme() {
    const konzert = new Konzert(form?.getFieldsValue(true));
    const sum =
      konzert.kasse.ausgabenOhneGage + konzert.kosten.totalEUR + (konzert.artist.brauchtHotel ? konzert.unterkunft.kostenTotalEUR : 0);
    setSumme(sum);
    onChange(sum);
  }

  const steuerSaetze = ["ohne", "7% MWSt.", "19% MWSt.", "18,8% Ausland"];

  function kassenZeile() {
    const kasse = new Kasse(form?.getFieldValue("kasse"));
    return (
      kasse.istFreigegeben && (
        <Row gutter={12}>
          <Col span={18}>
            <Form.Item>
              <b>Abendkasse (ohne Gage):</b>
            </Form.Item>
          </Col>
          <Col span={6}>
            <NumberInputWithDirectValue value={kasse.ausgabenOhneGage} suffix="€" decimals={2} />
          </Col>
        </Row>
      )
    );
  }
  function hotelZeile() {
    const konzert = new Konzert(form?.getFieldsValue(true));
    const unterkunft = konzert?.unterkunft;
    const artist = konzert?.artist;

    return (
      artist?.brauchtHotel && (
        <>
          <Row gutter={12}>
            <Col span={18}>
              <Form.Item>
                <b>Hotel:</b>
              </Form.Item>
            </Col>
            <Col span={6}>
              <NumberInputWithDirectValue value={unterkunft?.roomsTotalEUR || 0} suffix="€" decimals={2} />
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={18}>
              <Form.Item>
                <b>Hotel (Transport):</b>
              </Form.Item>
            </Col>
            <Col span={6}>
              <NumberInputWithDirectValue value={unterkunft?.transportEUR || 0} suffix="€" decimals={2} />
            </Col>
          </Row>
        </>
      )
    );
  }

  const { lg } = useBreakpoint();
  return (
    <Collapsible suffix="ausgaben" label="Kosten / Ausgaben" noTopBorder={lg} amount={summe}>
      <Row gutter={12}>
        <Col span={6}>
          <NumberInput name={["kosten", "gagenEUR"]} label={"Gagen"} decimals={2} suffix={"€"} onChange={updateSumme} />
        </Col>
        <Col span={6}>
          <SingleSelect name={["kosten", "gagenSteuer"]} label={"Steuer"} options={steuerSaetze} onChange={updateSumme} />
        </Col>
        <Col span={6}>
          <SingleSelect name={["kosten", "deal"]} label={"Deal"} options={Kosten.deals} onChange={updateSumme} />
        </Col>
        <Col span={6}>
          <DynamicItem
            nameOfDepending={["kosten", "gagenEUR"]}
            renderWidget={(getFieldValue) => {
              return (
                <DynamicItem
                  nameOfDepending={["kosten", "gagenSteuer"]}
                  renderWidget={() => {
                    const kosten = new Kosten(getFieldValue(["kosten"]));
                    return <NumberInputWithDirectValue label="Total" value={kosten.gagenTotalEUR} decimals={2} suffix="€" />;
                  }}
                />
              );
            }}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <DynamicItem
            nameOfDepending={["kosten", "gagenEUR"]}
            renderWidget={(getFieldValue) => {
              const gagen = getFieldValue(["kosten", "gagenEUR"]);
              const kskAnteil = gagen * 0.05;
              return <NumberInputWithDirectValue label="KSK (auf Gagen netto ohne Deal)" value={kskAnteil} decimals={2} suffix="€" />;
            }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <DynamicItem
            nameOfDepending={["kasse", "einnahmenReservix"]}
            renderWidget={() => (
              <DynamicItem
                nameOfDepending={["kasse", "einnahmeTicketsEUR"]}
                renderWidget={() => {
                  const kalk = new KonzertKalkulation(new Konzert(form?.getFieldsValue(true)));
                  return <NumberInputWithDirectValue label="GEMA (auf Eintritt und Reservix)" value={kalk.gema} decimals={2} suffix="€" />;
                }}
              />
            )}
          />
        </Col>
      </Row>
      <LabelCurrencyRow label="Provision Agentur" path={["kosten", "provisionAgentur"]} onChange={updateSumme} />
      {new Technik(form?.getFieldValue("technik")).fluegel && (
        <LabelCurrencyRow label="Flügelstimmer" path={["kosten", "fluegelstimmerEUR"]} onChange={updateSumme} />
      )}
      <LabelCurrencyChangeableRow label="Werbung 1" path={["kosten", "werbung1"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 2" path={["kosten", "werbung2"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 3" path={["kosten", "werbung3"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 4" path={["kosten", "werbung4"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 5" path={["kosten", "werbung5"]} onChange={updateSumme} />
      <LabelCurrencyChangeableRow label="Werbung 6" path={["kosten", "werbung6"]} onChange={updateSumme} />
      <LabelCurrencyRow label="Catering Musiker (unbar)" path={["kosten", "cateringMusiker"]} onChange={updateSumme} />
      <LabelCurrencyRow label="Catering Personal (unbar)" path={["kosten", "cateringPersonal"]} onChange={updateSumme} />
      <LabelCurrencyRow label="Personal (unbar)" path={["kosten", "personal"]} onChange={updateSumme} />
      <LabelCurrencyRow label="Tontechniker (unbar)" path={["kosten", "tontechniker"]} onChange={updateSumme} />
      <LabelCurrencyRow label="Lichttechniker (unbar)" path={["kosten", "lichttechniker"]} onChange={updateSumme} />
      {kassenZeile()}
      {hotelZeile()}
      <Row gutter={12}>
        <CheckItem label="Gage in BAR an der Abendkasse" name={["kosten", "gageBAR"]} />
      </Row>
      <LabelCurrencyRow label="Backline Rockshop" path={["kosten", "backlineEUR"]} disabled onChange={updateSumme} />
      <LabelCurrencyRow label="Technik Zumietung" path={["kosten", "technikAngebot1EUR"]} disabled onChange={updateSumme} />
      <LabelCurrencyRow label="Saalmiete" path={["kosten", "saalmiete"]} disabled onChange={updateSumme} />
    </Collapsible>
  );
}
