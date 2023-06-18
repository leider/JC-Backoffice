import _ from "lodash";
import { Mailingliste } from "jc-shared/user/users";
import User from "jc-shared/user/user";

export function toFormObject(liste: Mailingliste): object {
  return { id: liste.originalName, name: liste.name, users: liste.users.map((u) => u.id) };
}
export function fromFormObjectAsAny(formObject: any, users: User[]): Mailingliste {
  return new Mailingliste(
    formObject.name,
    users.filter((user) => formObject.users.includes(user.id)),
    formObject.originalName
  );
}
