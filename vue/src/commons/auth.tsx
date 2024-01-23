import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as jose from "jose";
import { LoginState } from "./authConsts";
import { useLocation, useNavigate } from "react-router-dom";

class AuthApi {
  loginPost(name: string, pass: string) {
    return axios.post("/login", { name, pass });
  }
  async refreshTokenPost() {
    const result = await axios.post("/refreshToken");
    return result.data.token;
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

  const scheduleTokenRefresh = async (inMs: number) => {
    setTimeout(
      async () => {
        try {
          const token = await authApi.refreshTokenPost();
          setAuthHeader(token);
        } catch (_) {
          logout();
        }
      },
      // request new token one minute before it expires
      inMs - 60_000,
    );
  };

  const setAuthHeader = useCallback(
    (token: string) => {
      const decoded = jose.decodeJwt<{ exp: number }>(token);
      axios.defaults.headers.Authorization = `Bearer ${token}`;
      scheduleTokenRefresh(decoded.exp * 1000 - Date.now());
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const setTokenForAuthHeader = useCallback(
    async (token: string) => {
      await queryClient.invalidateQueries();
      setAuthHeader(token);
      setLoginState(LoginState.LOGGED_IN);
    },
    [queryClient, setAuthHeader],
  );

  async function login(username: string, password: string) {
    setLoginState(LoginState.PENDING);
    try {
      const token = await authApi.loginPost(username, password);
      setTokenForAuthHeader(token.data.token);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.status === 401) {
        if (!location.pathname.startsWith("/login")) {
          window.location.reload();
        }
        setLoginState(LoginState.CREDENTIALS_INVALID);
      } else {
        logout();
      }
    }
  }

  const logout = useCallback(async () => {
    try {
      setLoginState(LoginState.LOGGED_OUT);
      delete axios.defaults.headers.Authorization;
      await authApi.logoutManually();
    } catch (_) {
      // so what?
    } finally {
      queryClient.invalidateQueries();
      if (location.pathname !== "/login") {
        navigate({ pathname: "/login", search: encodeURIComponent(location.pathname) });
      }
    }
  }, [location.pathname, navigate, queryClient]);

  useEffect(() => {
    async function doit() {
      if (loginState === LoginState.UNKNOWN) {
        try {
          const token = await authApi.refreshTokenPost();
          setTokenForAuthHeader(token);
        } catch (e) {
          logout();
        }
      }
    }
    doit();
  }, [loginState, logout, setTokenForAuthHeader]);

  return {
    loginState,
    login,
    logout,
  };
}
