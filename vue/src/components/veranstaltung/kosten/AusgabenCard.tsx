import React, { useContext, useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, Row } from "antd";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { NumberInput } from "@/widgets/numericInputWidgets";
import SingleSelect from "@/widgets/SingleSelect";
import Kosten from "jc-shared/veranstaltung/kosten";
import { DynamicItem } from "@/widgets/DynamicItem";
import Kasse from "jc-shared/veranstaltung/kasse";
import CheckItem from "@/widgets/CheckItem";
import { NumberInputWithDirectValue } from "@/widgets/numericInputWidgets/NumericInputs";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { TextField } from "@/widgets/TextField.tsx";
import Technik from "jc-shared/veranstaltung/technik.ts";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";

interface AusgabenCardParams {
  onChange: (sum: number) => void;
}
export default function AusgabenCard({ onChange }: AusgabenCardParams) {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;

  const [summe, setSumme] = useState<number>(0);

  const unterkunft = Form.useWatch(["unterkunft"], {
    form,
    preserve: true,
  });

  const brauchtHotel = Form.useWatch(["artist", "brauchtHotel"], {
    form,
    preserve: true,
  });

  const backlineEUR = Form.useWatch(["kosten", "backlineEUR"], {
    form,
    preserve: true,
  });

  const technikAngebot1EUR = Form.useWatch(["kosten", "technikAngebot1EUR"], {
    form,
    preserve: true,
  });

  const fluegelstimmerEUR = Form.useWatch(["kosten", "fluegelstimmerEUR"], {
    form,
    preserve: true,
  });

  useEffect(
    () => {
      updateSumme();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, unterkunft, brauchtHotel, backlineEUR, technikAngebot1EUR, fluegelstimmerEUR],
  );

  function updateSumme() {
    const veranst = new Veranstaltung(form.getFieldsValue(true));
    const sum =
      veranst.kasse.ausgabenOhneGage + veranst.kosten.totalEUR + (veranst.artist.brauchtHotel ? veranst.unterkunft.kostenTotalEUR : 0);
    setSumme(sum);
    onChange(sum);
  }

  const steuerSaetze = ["ohne", "7% MWSt.", "19% MWSt.", "18,8% Ausland"];

  function LabelCurrencyRow({ label, path }: { label: string; path: string[] }) {
    return (
      <Row gutter={12}>
        <Col span={18}>
          <Form.Item>
            <b>{label}:</b>
          </Form.Item>
        </Col>
        <Col span={6}>
          <NumberInput name={path} decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
    );
  }

  function LabelCurrencyChangeableRow({ label, path }: { label: string; path: string[] }) {
    return (
      <Row gutter={12}>
        <Col span={18}>
          <TextField label={label} name={[path[0], path[1] + "Label"]} initialValue={label} />
        </Col>
        <Col span={6}>
          <NumberInput label="Betrag" name={path} decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
    );
  }

  function kassenZeile() {
    const kasse = new Kasse(form.getFieldValue("kasse"));
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
    const veranst = new Veranstaltung(form.getFieldsValue(true));
    const unterkunft = veranst?.unterkunft;
    const artist = veranst?.artist;

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
    <CollapsibleForVeranstaltung suffix="ausgaben" label="Kosten / Ausgaben" noTopBorder={lg} amount={summe}>
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
      <LabelCurrencyRow label="Provision Agentur" path={["kosten", "provisionAgentur"]} />
      <LabelCurrencyRow label="Backline Rockshop" path={["kosten", "backlineEUR"]} />
      <LabelCurrencyRow label="Technik Zumietung" path={["kosten", "technikAngebot1EUR"]} />
      {new Technik(form.getFieldValue("technik")).fluegel && (
        <LabelCurrencyRow label="Flügelstimmer" path={["kosten", "fluegelstimmerEUR"]} />
      )}
      <LabelCurrencyRow label="Saalmiete" path={["kosten", "saalmiete"]} />
      <LabelCurrencyChangeableRow label="Werbung 1" path={["kosten", "werbung1"]} />
      <LabelCurrencyChangeableRow label="Werbung 2" path={["kosten", "werbung2"]} />
      <LabelCurrencyChangeableRow label="Werbung 3" path={["kosten", "werbung3"]} />
      <LabelCurrencyRow label="Catering Musiker (unbar)" path={["kosten", "cateringMusiker"]} />
      <LabelCurrencyRow label="Catering Personal (unbar)" path={["kosten", "cateringPersonal"]} />
      <LabelCurrencyRow label="Personal (unbar)" path={["kosten", "personal"]} />
      <LabelCurrencyRow label="Tontechniker (unbar)" path={["kosten", "tontechniker"]} />
      <LabelCurrencyRow label="Lichttechniker (unbar)" path={["kosten", "lichttechniker"]} />
      {kassenZeile()}
      {hotelZeile()}
      <Row gutter={12}>
        <CheckItem label="Gage in BAR an der Abendkasse" name={["kosten", "gageBAR"]} />
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
