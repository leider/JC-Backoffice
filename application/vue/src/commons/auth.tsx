import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoginState } from "./authConsts";
import { useLocation, useNavigate } from "react-router";
import { loginPost, logoutManually, refreshTokenPost } from "@/commons/loader.ts";

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
  const isAuthenticated = useMemo(() => loginState === LoginState.LOGGED_IN, [loginState]);
  const refetchInterval = 10 * 60 * 1000;

  const { error } = useQuery({
    enabled: isAuthenticated,
    queryKey: ["refreshToken"],
    queryFn: () => refreshTokenPost(),
    refetchInterval,
    refetchIntervalInBackground: true,
  });

  async function login(username: string, password: string) {
    setLoginState(LoginState.PENDING);
    try {
      await loginPost(username, password);
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
      await logoutManually();
    } catch {
      // so what?
    } finally {
      queryClient.invalidateQueries();
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      if (location.pathname !== "/login") {
        navigate({ pathname: "/login", search: encodeURIComponent(location.pathname) });
      }
    }
  }, [location.pathname, navigate, queryClient]);

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error, logout]);

  useEffect(() => {
    async function doit() {
      if (loginState === LoginState.UNKNOWN) {
        try {
          await refreshTokenPost();
          setLoginState(LoginState.LOGGED_IN);
        } catch {
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
