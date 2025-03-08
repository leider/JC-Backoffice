import React, { useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form } from "antd";
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
import { JazzRow } from "@/widgets/JazzRow.tsx";

interface AusgabenCardParams {
  readonly onChange: (sum: number) => void;
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
    const konzert = new Konzert(form.getFieldsValue(true));
    const sum =
      konzert.kasse.ausgabenOhneGage + konzert.kosten.totalEUR + (konzert.artist.brauchtHotel ? konzert.unterkunft.kostenTotalEUR : 0);
    setSumme(sum);
    onChange(sum);
  }

  const steuerSaetze = ["ohne", "7% MWSt.", "19% MWSt.", "18,8% Ausland"];

  function kassenZeile() {
    const kasse = new Kasse(form.getFieldValue("kasse"));
    return (
      kasse.istFreigegeben && (
        <JazzRow>
          <Col span={18}>
            <Form.Item>
              <b>Abendkasse (ohne Gage):</b>
            </Form.Item>
          </Col>
          <Col span={6}>
            <NumberInputWithDirectValue decimals={2} suffix="€" value={kasse.ausgabenOhneGage} />
          </Col>
        </JazzRow>
      )
    );
  }
  function hotelZeile() {
    const konzert = new Konzert(form.getFieldsValue(true));
    const unterkunft = konzert?.unterkunft;
    const artist = konzert?.artist;

    return (
      artist?.brauchtHotel && (
        <>
          <JazzRow>
            <Col span={18}>
              <Form.Item>
                <b>Hotel:</b>
              </Form.Item>
            </Col>
            <Col span={6}>
              <NumberInputWithDirectValue decimals={2} suffix="€" value={unterkunft?.roomsTotalEUR || 0} />
            </Col>
          </JazzRow>
          <JazzRow>
            <Col span={18}>
              <Form.Item>
                <b>Hotel (Transport):</b>
              </Form.Item>
            </Col>
            <Col span={6}>
              <NumberInputWithDirectValue decimals={2} suffix="€" value={unterkunft?.transportEUR || 0} />
            </Col>
          </JazzRow>
        </>
      )
    );
  }

  const { lg } = useBreakpoint();
  return (
    <Collapsible amount={summe} label="Kosten / Ausgaben" noTopBorder={lg} suffix="ausgaben">
      <JazzRow>
        <Col span={6}>
          <NumberInput decimals={2} label="Gagen" name={["kosten", "gagenEUR"]} onChange={updateSumme} suffix="€" />
        </Col>
        <Col span={6}>
          <SingleSelect label="Steuer" name={["kosten", "gagenSteuer"]} onChange={updateSumme} options={steuerSaetze} />
        </Col>
        <Col span={6}>
          <SingleSelect label="Deal" name={["kosten", "deal"]} onChange={updateSumme} options={Kosten.deals} />
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
                    return <NumberInputWithDirectValue decimals={2} label="Total" suffix="€" value={kosten.gagenTotalEUR} />;
                  }}
                />
              );
            }}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col sm={12} xs={24}>
          <DynamicItem
            nameOfDepending={["kosten", "gagenEUR"]}
            renderWidget={(getFieldValue) => {
              const gagen = getFieldValue(["kosten", "gagenEUR"]);
              const kskAnteil = gagen * 0.05;
              return <NumberInputWithDirectValue decimals={2} label="KSK (auf Gagen netto ohne Deal)" suffix="€" value={kskAnteil} />;
            }}
          />
        </Col>
        <Col sm={12} xs={24}>
          <DynamicItem
            nameOfDepending={["kasse", "einnahmenReservix"]}
            renderWidget={() => (
              <DynamicItem
                nameOfDepending={["kasse", "einnahmeTicketsEUR"]}
                renderWidget={() => {
                  const kalk = new KonzertKalkulation(new Konzert(form.getFieldsValue(true)));
                  return <NumberInputWithDirectValue decimals={2} label="GEMA (auf Eintritt und Reservix)" suffix="€" value={kalk.gema} />;
                }}
              />
            )}
          />
        </Col>
      </JazzRow>
      <LabelCurrencyRow label="Provision Agentur" onChange={updateSumme} path={["kosten", "provisionAgentur"]} />
      {new Technik(form.getFieldValue("technik")).fluegel ? (
        <LabelCurrencyRow label="Flügelstimmer" onChange={updateSumme} path={["kosten", "fluegelstimmerEUR"]} />
      ) : null}
      <LabelCurrencyChangeableRow label="Werbung 1" onChange={updateSumme} path={["kosten", "werbung1"]} />
      <LabelCurrencyChangeableRow label="Werbung 2" onChange={updateSumme} path={["kosten", "werbung2"]} />
      <LabelCurrencyChangeableRow label="Werbung 3" onChange={updateSumme} path={["kosten", "werbung3"]} />
      <LabelCurrencyChangeableRow label="Werbung 4" onChange={updateSumme} path={["kosten", "werbung4"]} />
      <LabelCurrencyChangeableRow label="Werbung 5" onChange={updateSumme} path={["kosten", "werbung5"]} />
      <LabelCurrencyChangeableRow label="Werbung 6" onChange={updateSumme} path={["kosten", "werbung6"]} />
      <LabelCurrencyRow label="Catering Musiker (unbar)" onChange={updateSumme} path={["kosten", "cateringMusiker"]} />
      <LabelCurrencyRow label="Catering Personal (unbar)" onChange={updateSumme} path={["kosten", "cateringPersonal"]} />
      <LabelCurrencyRow label="Personal (unbar)" onChange={updateSumme} path={["kosten", "personal"]} />
      <LabelCurrencyRow label="Tontechniker (unbar)" onChange={updateSumme} path={["kosten", "tontechniker"]} />
      <LabelCurrencyRow label="Lichttechniker (unbar)" onChange={updateSumme} path={["kosten", "lichttechniker"]} />
      {kassenZeile()}
      {hotelZeile()}
      <JazzRow>
        <CheckItem label="Gage in BAR an der Abendkasse" name={["kosten", "gageBAR"]} />
      </JazzRow>
      <LabelCurrencyRow disabled label="Backline Rockshop" onChange={updateSumme} path={["kosten", "backlineEUR"]} />
      <LabelCurrencyRow disabled label="Technik Zumietung" onChange={updateSumme} path={["kosten", "technikAngebot1EUR"]} />
      <LabelCurrencyRow disabled label="Saalmiete" onChange={updateSumme} path={["kosten", "saalmiete"]} />
    </Collapsible>
  );
}
