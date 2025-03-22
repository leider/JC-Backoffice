import axios from "axios";

export async function loginPost(name: string, pass: string) {
  const token = await axios.post("/login", { name, pass });
  return refreshTokenPost(token.data.token);
}

export async function logoutManually() {
  return axios.post("/logout");
}

export async function refreshTokenPost(tokenFromLogin?: string) {
  let token = tokenFromLogin;
  if (!tokenFromLogin) {
    const result = await axios.post("/refreshToken");
    token = result.data.token;
  }
  if (!token) {
    return "";
  }
  axios.defaults.headers.Authorization = `Bearer ${token}`;
  return token;
}
