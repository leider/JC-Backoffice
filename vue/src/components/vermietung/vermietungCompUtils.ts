import Vermietung from "jc-shared/vermietung/vermietung";
import { Dayjs } from "dayjs";
import { FormInstance } from "antd";
import _ from "lodash";

export type StartAndEnd = {
  start: Dayjs;
  end: Dayjs;
};
export function toFormObject(vermietung: Vermietung): object {
  const result: any = vermietung.toJSON();
  result.startAndEnd = {
    start: vermietung.startDatumUhrzeit.value,
    end: vermietung.endDatumUhrzeit.value,
  };
  return result;
}
export function fromFormObject(form: FormInstance): Vermietung {
  return fromFormObjectAsAny(form.getFieldsValue(true));
}

export function fromFormObjectAsAny(formObject: any): Vermietung {
  const fieldsValues = _.cloneDeep(formObject);
  fieldsValues.startDate = fieldsValues.startAndEnd.start.toDate();
  fieldsValues.endDate = fieldsValues.startAndEnd.end.toDate();

  return new Vermietung(fieldsValues);
}
