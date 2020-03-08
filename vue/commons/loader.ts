import fetch from "cross-fetch";
import Veranstaltung from "../../lib/veranstaltungen/object/veranstaltung";
import User from "../../lib/users/user";

function getJson(url: string, callback: any): void {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw Error(response as any);
      }
      return response.json();
    })
    .then(callback);
}

function postAndReceive(url: string, data: any, callback: any) {
  getJson("/vue-spa/csrf-token.json", (res: any) => {
    fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "same-origin", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": res.token
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(callback)
      .catch(err => callback({ severity: "error", message: err.toString() }));
  });
}

export function veranstaltungenForTeam(callback: Function): void {
  getJson("/vue-spa/veranstaltungen.json", (result: object[]) => {
    callback(result.map(r => new Veranstaltung(r)));
  });
}

export function saveVeranstaltung(veranstaltung: Veranstaltung, callback: Function) {
  postAndReceive("/vue-spa/saveVeranstaltung", veranstaltung.toJSON(), callback);
}

export function currentUser(callback: Function): void {
  getJson("/vue-spa/user.json", (result: object) => {
    callback(new User(result));
  });
}

export function allUsers(callback: Function): void {
  getJson("/vue-spa/allusers.json", (result: object[]) => {
    callback(result.map(r => new User(r)));
  });
}

export function saveUser(user: User, callback: Function) {
  postAndReceive("/vue-spa/saveUser", user.toJSON(), callback);
}

export function wikisubdirs(callback: Function): void {
  getJson("/vue-spa/wikisubdirs.json", callback);
}
