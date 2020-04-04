import fetch from "cross-fetch";
import Veranstaltung from "../../lib/veranstaltungen/object/veranstaltung";
import User from "../../lib/users/user";
import { StaffType } from "../../lib/veranstaltungen/object/staff";

function getJson(url: string, callback: any): void {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response as any);
      }
      return response.json();
    })
    .then((json) => callback(null, json))
    .catch((err) => callback(err));
}

function postAndReceive(url: string, data: any, callback: any) {
  getJson("/vue-spa/csrf-token.json", (err: Error, res: any) => {
    fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "same-origin", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": res.token,
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then((json) => callback(null, json))
      .catch((err) => callback(err));
  });
}

export function veranstaltungenForTeam(callback: Function): void {
  getJson("/vue-spa/veranstaltungen.json", (err: Error, result: object[]) => {
    callback(result.map((r) => new Veranstaltung(r)));
  });
}

export function saveVeranstaltung(veranstaltung: Veranstaltung, callback: Function): void {
  postAndReceive("/vue-spa/saveVeranstaltung", veranstaltung.toJSON(), (err: Error, json: object) => callback(json));
}

export function addUserToSection(veranstaltungId: string, section: StaffType, callback: Function): void {
  postAndReceive("/vue-spa/addUserToSection", { id: veranstaltungId, section }, callback);
}

export function removeUserFromSection(veranstaltungId: string, section: StaffType, callback: Function): void {
  postAndReceive("/vue-spa/removeUserFromSection", { id: veranstaltungId, section }, callback);
}

export function currentUser(callback: Function): void {
  getJson("/vue-spa/user.json", (err: Error, result: object) => {
    callback(new User(result));
  });
}

export function allUsers(callback: Function): void {
  getJson("/vue-spa/allusers.json", (err: Error, result: object[]) => {
    callback(result.map((r) => new User(r)));
  });
}

export function saveUser(user: User, callback: Function): void {
  postAndReceive("/vue-spa/saveUser", user.toJSON(), (err: Error, json: object) => callback(json));
}

export function icals(callback: Function): void {
  getJson("/vue-spa/icals.json", (err: Error, json: object) => callback(json));
}

export function wikisubdirs(callback: Function): void {
  getJson("/vue-spa/wikisubdirs.json", (err: Error, json: object) => callback(json));
}
