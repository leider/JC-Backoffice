import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { useMemo } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";

export default function useAusgaben() {
  const form = useFormInstance();
  const unterkunft = useWatch(["unterkunft"], { form, preserve: true });
  const brauchtHotel = useWatch(["artist", "brauchtHotel"], { form, preserve: true });
  const fluegelstimmerEUR = useWatch(["kosten", "fluegelstimmerEUR"], { form, preserve: true });
  const gagenEUR = useWatch(["kosten", "gagenEUR"], { form, preserve: true });
  const gagenSteuer = useWatch(["kosten", "gagenSteuer"], { form, preserve: true });
  const deal = useWatch(["kosten", "deal"], { form, preserve: true });
  const provision = useWatch(["kosten", "provisionAgentur"], { form, preserve: true });
  const werbung1 = useWatch(["kosten", "werbung1"], { form, preserve: true });
  const werbung2 = useWatch(["kosten", "werbung2"], { form, preserve: true });
  const werbung3 = useWatch(["kosten", "werbung3"], { form, preserve: true });
  const cateringMusiker = useWatch(["kosten", "cateringMusiker"], { form, preserve: true });
  const cateringPersonal = useWatch(["kosten", "cateringPersonal"], { form, preserve: true });
  const personal = useWatch(["kosten", "personal"], { form, preserve: true });
  const tontechniker = useWatch(["kosten", "tontechniker"], { form, preserve: true });
  const lichttechniker = useWatch(["kosten", "lichttechniker"], { form, preserve: true });

  return useMemo(
    () => {
      const konzert = new Konzert(form.getFieldsValue(true));
      return (
        konzert.kasse.ausgabenOhneGage + konzert.kosten.totalEUR + (konzert.artist.brauchtHotel ? konzert.unterkunft.kostenTotalEUR : 0)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      unterkunft,
      brauchtHotel,
      fluegelstimmerEUR,
      gagenEUR,
      gagenSteuer,
      deal,
      provision,
      werbung1,
      werbung2,
      werbung3,
      cateringMusiker,
      cateringPersonal,
      personal,
      tontechniker,
      lichttechniker,
    ],
  );
}
