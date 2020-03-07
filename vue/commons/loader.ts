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

function postAndReceive(responseCallback: any, url: string, data: any, callback: any) {
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
        return responseCallback(response);
      })
      .then(callback)
      .catch(err => callback({ severity: "error", message: err.toString() }));
  });
}

export function postAndReceiveJSON(url: string, data: any, callback: any) {
  postAndReceive((res: Response) => res.json(), url, data, callback);
}

export function veranstaltungenForTeam(callback: Function): void {
  getJson("/vue-spa/veranstaltungen.json", (result: object[]) => {
    callback(result.map(r => new Veranstaltung(r)));
  });
}

export function currentUser(callback: Function): void {
  getJson("/vue-spa/user.json", (result: object) => {
    callback(new User(result));
  });
}

export function wikisubdirs(callback: Function): void {
  getJson("/vue-spa/wikisubdirs.json", callback);
}
