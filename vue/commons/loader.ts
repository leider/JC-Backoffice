/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "cross-fetch";
import Veranstaltung from "../../lib/veranstaltungen/object/veranstaltung";
import User from "../../lib/users/user";
import { StaffType } from "../../lib/veranstaltungen/object/staff";
import Kalender from "../../lib/programmheft/kalender";
import DatumUhrzeit from "../../lib/commons/DatumUhrzeit";

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

function postAndReceive(url: string, data: any, callback: any): void {
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

export function veranstaltungenForTeam(selector: "zukuenftige" | "vergangene", callback: Function): void {
  getJson(`/veranstaltungen/${selector}.json`, (err: Error, result: object[]) => {
    callback(result.map((r) => new Veranstaltung(r)));
  });
}

export function saveVeranstaltung(veranstaltung: Veranstaltung, callback: Function): void {
  postAndReceive("/veranstaltungen/saveVeranstaltung", veranstaltung.toJSON(), (err: Error, json: object) => callback(json));
}

export function addUserToSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  postAndReceive(`${veranstaltung.fullyQualifiedUrl()}/addUserToSection`, { section }, callback);
}

export function removeUserFromSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  postAndReceive(`${veranstaltung.fullyQualifiedUrl()}/removeUserFromSection`, { section }, callback);
}

export function currentUser(callback: Function): void {
  getJson("/users/user.json", (err: Error, result: object) => {
    callback(new User(result));
  });
}

export function allUsers(callback: Function): void {
  getJson("/users/allusers.json", (err: Error, result: object[]) => {
    callback(result.map((r) => new User(r)));
  });
}

export function saveUser(user: User, callback: Function): void {
  postAndReceive("/users/saveUser", user.toJSON(), (err: Error, json: object) => callback(json));
}

export function icals(callback: Function): void {
  getJson("/ical/calURLs.json", (err: Error, json: object) => callback(json));
}

export function wikisubdirs(callback: Function): void {
  getJson("/vue-spa/wikisubdirs.json", (err: Error, json: object) => callback(json));
}

export function kalenderFor(jahrMonat: string, callback: Function): void {
  getJson(`/programmheft/${jahrMonat}.json`, (err: Error, result: { id: string; text: string }) => {
    callback(new Kalender(result));
  });
}

export function veranstaltungenBetween(start: DatumUhrzeit, end: DatumUhrzeit, callback: Function): void {
  getJson(`/veranstaltungen/${start.yyyyMM}/${end.yyyyMM}/list.json`, (err: Error, result: object[]) => {
    callback(result.map((r) => new Veranstaltung(r)));
  });
}

export function saveProgrammheft(kalender: Kalender, callback: Function): void {
  postAndReceive("/programmheft/saveProgrammheft", kalender, (err: Error, json: object) => callback(json));
}
