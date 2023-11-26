import dayjs from "dayjs";
import Termin from "jc-shared/optionen/termin";
import cloneDeep from "lodash/cloneDeep";

export function toFormObject(termin: Termin): object {
  const result: any = termin.toJSON();
  result.period = [dayjs(termin.startDate), dayjs(termin.endDate)];
  return result;
}
export function fromFormObjectAsAny(formObject: any): Termin {
  const fieldsValues = cloneDeep(formObject);
  fieldsValues.startDate = fieldsValues.period[0].toDate();
  fieldsValues.endDate = fieldsValues.period[1].toDate();

  return new Termin(fieldsValues);
}
