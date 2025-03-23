import { FormInstance } from "antd";
import { TeamFilterObject } from "@/components/team/TeamFilter/applyTeamFilter.ts";

export function reset(form: FormInstance<TeamFilterObject>) {
  form.setFieldsValue({
    istKonzert: undefined,
    hotelBestaetigt: undefined,
    presse: { text: undefined, originalText: undefined, checked: undefined },
    kopf: {
      confirmed: undefined,
      abgesagt: undefined,
      kannAufHomePage: undefined,
      kannInSocialMedia: undefined,
      fotografBestellen: undefined,
      eventTyp: undefined,
    },
    technik: { checked: undefined, fluegel: undefined },
    booker: [],
  });
}
