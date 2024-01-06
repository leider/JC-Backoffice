import axios from "axios";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as jose from "jose";
import { LoginState } from "./authConsts";
import { useLocation, useNavigate } from "react-router-dom";

class AuthApi {
  loginPost(name: string, pass: string) {
    return axios.post("/login", { name, pass });
  }
  refreshTokenPost() {
    return axios.post("/refreshToken");
  }
  logoutManually() {
    return axios.post("/logout");
  }
}

const authApi = new AuthApi();

export interface IUseProvideAuth {
  /**
   * The current login state.
   * @type {LoginState}
   * @memberof IUseProvideAuth
   */
  loginState: LoginState;

  /**
   * Function to login with.
   * @memberof IUseProvideAuth
   */
  login: (username: string, password: string) => Promise<void>;

  /**
   * Function to logout with.
   * @memberof IUseProvideAuth
   */
  logout: () => Promise<void>;
}

/**
 * Provider hook that creates auth object and handles state
 * @return {*}  {IUseProvideAuth}
 */
export function useProvideAuth(): IUseProvideAuth {
  const [loginState, setLoginState] = useState(LoginState.UNKNOWN);

  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = useQueryClient();

  function setAuthHeader(token: string) {
    axios.defaults.headers.Authorization = `Bearer ${token}`;
  }

  async function scheduleTokenRefresh(inMs: number) {
    setTimeout(
      async () => {
        try {
          const newToken = await authApi.refreshTokenPost();
          const decoded = jose.decodeJwt<{ exp: number }>(newToken.data.token);
          setAuthHeader(newToken.data.token);
          scheduleTokenRefresh(decoded.exp * 1000 - Date.now());
        } catch (_) {
          // eslint-disable-next-line no-console
          console.log("LOGGIN OUT", _);
          logout();
        }
      },
      // request new token one minute before it expires
      inMs - 60_000,
    );
  }

  function setTokenAndLoginState(info: string) {
    const decoded = jose.decodeJwt<{ exp: number }>(info);
    setAuthHeader(info);
    setLoginState(LoginState.LOGGED_IN);
    scheduleTokenRefresh(decoded.exp * 1000 - Date.now());
  }

  async function login(username: string, password: string) {
    setLoginState(LoginState.PENDING);
    try {
      const token = await authApi.loginPost(username, password);
      setTokenAndLoginState(token.data.token);
      await queryClient.invalidateQueries();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.status === 401) {
        setLoginState(LoginState.CREDENTIALS_INVALID);
      } else {
        setLoginState(LoginState.LOGGED_OUT);
      }
    }
  }

  async function logout() {
    try {
      setLoginState(LoginState.LOGGED_OUT);
      delete axios.defaults.headers.Authorization;
      await authApi.logoutManually();
    } catch (_) {
      // so what?
    } finally {
      queryClient.invalidateQueries();
    }
  }

  async function checkLoginStateInitially() {
    try {
      const newToken = await authApi.refreshTokenPost();
      setTokenAndLoginState(newToken.data.token);
    } catch (e) {
      // some token cookies are non existent in the backend (already deleted -> false positive)
      if (location.pathname !== "/login") {
        return navigate({ pathname: "/login", search: encodeURIComponent("/") });
      }
    }
  }

  if (loginState === LoginState.UNKNOWN) {
    checkLoginStateInitially();
  }

  return {
    loginState,
    login,
    logout,
  };
}
