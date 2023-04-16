import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as jose from "jose";
import User from "jc-shared/user/user";
import { currentUser, wikisubdirs } from "@/commons/loader-for-react";

class AuthApi {
  loginPost(name: string, pass: string) {
    return axios.post("/login", { name, pass });
  }
  logoutPost() {
    return axios.post("/security/logout");
  }
  refreshTokenPost() {
    return axios.post("/refreshToken");
  }
}

const authApi = new AuthApi();

/**
 * The different loggin states the user can be in.
 * @export
 * @enum {number}
 */
export enum LoginState {
  UNKNOWN,
  PENDING,
  CREDENTIALS_INVALID,
  LOGGED_IN,
  LOGGED_OUT,
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios.defaults.headers as any).Authorization = `Bearer ${token}`;
  }

  async function scheduleTokenRefresh(inMs: number) {
    setTimeout(
      async () => {
        try {
          console.log("REFRESH");
          const newToken = await authApi.refreshTokenPost();
          setAuthHeader(newToken.data.token);
          scheduleTokenRefresh(newToken.data.expires - Date.now());
        } catch (_) {
          console.log("LOGGIN OUT", _);
          logout();
        }
      },
      // request new token one minute before it expires
      inMs - 60_000
    );
  }

  function setTokenAndLoginState(info: string) {
    const decoded = jose.decodeJwt(info) as { [key: string]: any };
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
      await authApi.logoutPost();
    } catch (_) {
      // so what?
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (axios.defaults.headers as any).Authorization;
      setLoginState(LoginState.LOGGED_OUT);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AuthContext = createContext<Auth>(null as any);

/**
 * Provider component that wraps the app and makes an auth object
 * available to any child component that calls useAuth()
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AuthProvider({ children }: { children: any }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Hook for child components to get the auth object
 * and re-render when it changes.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
