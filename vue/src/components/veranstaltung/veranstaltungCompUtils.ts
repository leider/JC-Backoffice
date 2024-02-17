import Konzert from "../../../../shared/konzert/konzert.ts";
import dayjs from "dayjs";
import { FormInstance } from "antd";
import cloneDeep from "lodash/cloneDeep";

export function toFormObject(veranstaltung: Konzert): object {
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
export function fromFormObject(form: FormInstance): Konzert {
  return fromFormObjectAsAny(form.getFieldsValue(true));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromFormObjectAsAny(formObject: any): Konzert {
  const fieldsValues = cloneDeep(formObject);
  fieldsValues.startDate = fieldsValues.startAndEnd.start.toDate();
  fieldsValues.endDate = fieldsValues.startAndEnd.end.toDate();
  const unterkunft = fieldsValues.unterkunft;
  unterkunft.anreiseDate = unterkunft.anAbreise[0].toDate();
  unterkunft.abreiseDate = unterkunft.anAbreise[1].toDate();

  return new Konzert(fieldsValues);
}
