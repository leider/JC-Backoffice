import Vermietung from "jc-shared/vermietung/vermietung";
import { FormInstance } from "antd";
import cloneDeep from "lodash/cloneDeep";

export function toFormObject(vermietung: Vermietung): object {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromFormObjectAsAny(formObject: any): Vermietung {
  const fieldsValues = cloneDeep(formObject);
  fieldsValues.startDate = fieldsValues.startAndEnd.start.toDate();
  fieldsValues.endDate = fieldsValues.startAndEnd.end.toDate();

  return new Vermietung(fieldsValues);
}
