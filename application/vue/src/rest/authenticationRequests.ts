import axios from "axios";
import constant from "lodash/constant";

axios.defaults.withCredentials = true;

export async function loginPost(name: string, pass: string) {
  await axios.post("/login", { name, pass });
}

export async function logoutManually() {
  return axios.post("/logout");
}

/** Returns true if the session cookie is accepted and /rest/users/current succeeds. */
export async function checkSession(): Promise<boolean> {
  const res = await axios.get("/rest/users/current", { validateStatus: constant(true) });
  return res.status === 200;
}
