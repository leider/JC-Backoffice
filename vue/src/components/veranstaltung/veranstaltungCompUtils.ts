import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { Dayjs } from "dayjs";

export type StartAndEnd = {
  start: Dayjs;
  end: Dayjs;
};
export function toFormObject(veranstaltung: Veranstaltung): object {
  const result: any = veranstaltung.toJSON();
  result.startAndEnd = {
    start: veranstaltung.startDatumUhrzeit.value,
    end: veranstaltung.endDatumUhrzeit.value,
  };
  return result;
}
