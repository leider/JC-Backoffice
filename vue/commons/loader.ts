/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "cross-fetch";
import Veranstaltung, { ImageOverviewRow } from "../../lib/veranstaltungen/object/veranstaltung";
import User from "../../lib/users/user";
import { StaffType } from "../../lib/veranstaltungen/object/staff";
import Kalender from "../../lib/programmheft/kalender";
import DatumUhrzeit from "../../lib/commons/DatumUhrzeit";
import OptionValues from "../../lib/optionen/optionValues";
import Orte from "../../lib/optionen/orte";

function getJson(url: string, callback: any): void {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
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

function postAndReceiveForFiles(url: string, data: FormData, callback: any): void {
  getJson("/vue-spa/csrf-token.json", (err: Error, res: any) => {
    fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "same-origin", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "X-CSRF-TOKEN": res.token,
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: data, // body data type must match "Content-Type" header
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

export function uploadFile(data: FormData, callback: Function): void {
  postAndReceiveForFiles("/veranstaltungen/upload", data, (err: Error, json: object) => callback(json));
}

export function veranstaltungenForTeam(selector: "zukuenftige" | "vergangene" | "alle", callback: Function): void {
  getJson(`/veranstaltungen/${selector}.json`, (err: Error, result: object[]) => {
    callback(result.map((r) => new Veranstaltung(r)));
  });
}

export function saveVeranstaltung(veranstaltung: Veranstaltung, callback: Function): void {
  postAndReceive("/veranstaltungen/saveVeranstaltung", veranstaltung.toJSON(), callback);
}

export function deleteVeranstaltungWithId(id: string, callback: Function): void {
  postAndReceive("/veranstaltungen/deleteVeranstaltung", { id }, callback);
}

export function addUserToSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  postAndReceive(`${veranstaltung.fullyQualifiedUrl()}/addUserToSection`, { section }, callback);
}

export function removeUserFromSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  postAndReceive(`${veranstaltung.fullyQualifiedUrl()}/removeUserFromSection`, { section }, callback);
}

// User
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

export function deleteUser(user: User, callback: Function): void {
  postAndReceive("/users/deleteUser", user.toJSON(), (err: Error, json: object) => callback(json));
}

export function saveNewUser(user: User, callback: Function): void {
  postAndReceive("/users/saveNewUser", user.toJSON(), callback);
}

export function changePassword(user: User, callback: Function): void {
  postAndReceive("/users/changePassword", user.toJSON(), callback);
}

export function icals(callback: Function): void {
  getJson("/ical/calURLs.json", (err: Error, json: object) => callback(json));
}

export function wikisubdirs(callback: Function): void {
  getJson("/vue-spa/wikisubdirs.json", (err: Error, json: object) => callback(json));
}

// Programmheft
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

// Veranstaltung bearbeiten
export function veranstaltungForUrl(url: string, callback: Function): void {
  getJson(`/veranstaltungen/${encodeURIComponent(url)}.json`, (err: Error, result: any) => callback(new Veranstaltung(result)));
}

// Optionen
export function optionen(callback: Function): void {
  getJson("/optionen/optionen.json", (err: Error, result: any) => callback(new OptionValues(result)));
}

export function orte(callback: Function): void {
  getJson("/optionen/orte.json", (err: Error, result: any) => callback(new Orte(result)));
}

export function saveOptionen(optionen: OptionValues, callback: Function): void {
  postAndReceive("/optionen/saveOptionen", optionen.toJSON(), callback);
}

// Image
export function imagenames(callback: Function): void {
  getJson("/image/allImagenames.json", (err: Error, result: any) => callback(result));
}

export function saveImagenames(rows: ImageOverviewRow[], callback: Function): void {
  postAndReceive("/image/imagenamesChanged", rows, (err: Error, json: object) => callback(json));
}
