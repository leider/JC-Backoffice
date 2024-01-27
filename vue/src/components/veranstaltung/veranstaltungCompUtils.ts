import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import dayjs from "dayjs";
import { FormInstance } from "antd";
import cloneDeep from "lodash/cloneDeep";

export function toFormObject(veranstaltung: Veranstaltung): object {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromFormObjectAsAny(formObject: any): Veranstaltung {
  const fieldsValues = cloneDeep(formObject);
  fieldsValues.startDate = fieldsValues.startAndEnd.start.toDate();
  fieldsValues.endDate = fieldsValues.startAndEnd.end.toDate();
  const unterkunft = fieldsValues.unterkunft;
  unterkunft.anreiseDate = unterkunft.anAbreise[0].toDate();
  unterkunft.abreiseDate = unterkunft.anAbreise[1].toDate();

  return new Veranstaltung(fieldsValues);
}
