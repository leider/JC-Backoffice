import axios from "axios";
import * as jose from "jose";

/** Refresh JWT this many seconds before expiry to avoid bursts of 401s. */
const TOKEN_REFRESH_BUFFER_MS = 60_000;

let refreshSerial = 0;
let refreshInFlight: Promise<string> | null = null;

export async function loginPost(name: string, pass: string) {
  const token = await axios.post("/login", { name, pass });
  return refreshTokenPost(token.data.token);
}

export async function logoutManually() {
  refreshSerial++;
  refreshInFlight = null;
  return axios.post("/logout");
}

export async function refreshTokenPost(tokenFromLogin?: string): Promise<string> {
  if (tokenFromLogin) {
    refreshSerial++;
    axios.defaults.headers.Authorization = `Bearer ${tokenFromLogin}`;
    return tokenFromLogin;
  }
  const serialWhenStarted = refreshSerial;
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const result = await axios.post("/refreshToken");
      const token = result.data.token ?? "";
      if (serialWhenStarted !== refreshSerial) {
        return "";
      }
      if (token) {
        axios.defaults.headers.Authorization = `Bearer ${token}`;
      }
      return token;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * Ensures Axios has a non-expired Bearer token before REST calls.
 * Uses a single in-flight refresh for parallel requests; skips applying token if logout raced.
 */
export async function ensureValidAccessToken(): Promise<void> {
  const auth = axios.defaults.headers.Authorization;
  if (!auth || typeof auth !== "string") {
    await refreshTokenPost();
    return;
  }
  const raw = auth.replace(/^Bearer\s+/i, "");
  let exp: number | undefined;
  try {
    exp = jose.decodeJwt<{ exp?: number }>(raw).exp;
  } catch {
    await refreshTokenPost();
    return;
  }
  if (exp === undefined) {
    await refreshTokenPost();
    return;
  }
  if (exp * 1000 - Date.now() < TOKEN_REFRESH_BUFFER_MS) {
    await refreshTokenPost();
  }
}
