import axios from "axios";
import { PropsWithChildren, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as jose from "jose";
import User from "jc-shared/user/user";
import { currentUser, wikisubdirs } from "@/commons/loader.ts";
import { AuthContext, LoginState } from "./authConsts";

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

interface IUseProvideAuth {
  /**
   * The current login state.
   * @type {LoginState}
   * @memberof IUseProvideAuth
   */
  loginState: LoginState;

  context?: ApplicationContext;

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

export interface ApplicationContext {
  currentUser: User;
  wikisubdirs: { dirs: string[] };
}

/**
 * Provider hook that creates auth object and handles state
 * @return {*}  {IUseProvideAuth}
 */
function useProvideAuth(): IUseProvideAuth {
  const [loginState, setLoginState] = useState(LoginState.UNKNOWN);
  const [context, setContext] = useState<ApplicationContext | undefined>(undefined);
  useEffect(() => {
    async function innerWorker() {
      if (loginState === LoginState.LOGGED_IN) {
        const user = await currentUser();
        const wiki = await wikisubdirs();
        setContext({ currentUser: user, wikisubdirs: wiki });
      }
    }
    innerWorker();
  }, [loginState]);

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
      delete axios.defaults.headers.Authorization;
      await authApi.logoutManually();
      setLoginState(LoginState.LOGGED_OUT);
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
    } catch (_) {
      // some token cookies are non existent in the backend (already deleted -> false positive)
      return;
    }
  }

  if (loginState === LoginState.UNKNOWN) {
    //setLoginState(LoginState.PENDING);
    checkLoginStateInitially();
  }

  return {
    loginState,
    context,
    login,
    logout,
  };
}

export type Auth = ReturnType<typeof useProvideAuth>;

/**
 * Provider component that wraps the app and makes an auth object
 * available to any child component that calls useAuth()
 */
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
