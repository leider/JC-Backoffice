import Konzert from "../../../../shared/konzert/konzert.ts";
import dayjs from "dayjs";
import { FormInstance } from "antd";
import cloneDeep from "lodash/cloneDeep";

export function toFormObject(konzert: Konzert): object {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = konzert.toJSON();
  result.startAndEnd = {
    start: konzert.startDatumUhrzeit.value,
    end: konzert.endDatumUhrzeit.value,
  };
  result.unterkunft.anAbreise = [dayjs(konzert.unterkunft.anreiseDate), dayjs(konzert.unterkunft.abreiseDate)];
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
