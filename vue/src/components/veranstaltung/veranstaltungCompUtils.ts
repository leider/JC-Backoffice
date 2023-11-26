import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import dayjs, { Dayjs } from "dayjs";
import { FormInstance } from "antd";
import cloneDeep from "lodash/cloneDeep";

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
  result.unterkunft.anAbreise = [dayjs(veranstaltung.unterkunft.anreiseDate), dayjs(veranstaltung.unterkunft.abreiseDate)];
  result.kopf.flaeche = parseInt(result.kopf.flaeche, 10);
  return result;
}
export function fromFormObject(form: FormInstance): Veranstaltung {
  return fromFormObjectAsAny(form.getFieldsValue(true));
}

export function fromFormObjectAsAny(formObject: any): Veranstaltung {
  const fieldsValues = cloneDeep(formObject);
  fieldsValues.startDate = fieldsValues.startAndEnd.start.toDate();
  fieldsValues.endDate = fieldsValues.startAndEnd.end.toDate();
  const unterkunft = fieldsValues.unterkunft;
  unterkunft.anreiseDate = unterkunft.anAbreise[0].toDate();
  unterkunft.abreiseDate = unterkunft.anAbreise[1].toDate();

  return new Veranstaltung(fieldsValues);
}
