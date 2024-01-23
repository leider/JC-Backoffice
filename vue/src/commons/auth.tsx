import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoginState } from "./authConsts";
import { useLocation, useNavigate } from "react-router-dom";
import { refreshTokenPost } from "@/commons/loader.ts";

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

  async function login(username: string, password: string) {
    setLoginState(LoginState.PENDING);
    try {
      const token = await authApi.loginPost(username, password);
      refreshTokenPost(token.data.token);
      setLoginState(LoginState.LOGGED_IN);
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
        const token = await refreshTokenPost();
        if (token) {
          setLoginState(LoginState.LOGGED_IN);
        } else {
          logout();
        }
      }
    }
    doit();
  }, [loginState, logout]);

  return {
    loginState,
    login,
    logout,
  };
}
