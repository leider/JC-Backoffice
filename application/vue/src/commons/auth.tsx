import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoginState } from "./authConsts";
import { useLocation, useNavigate } from "react-router";
import { checkSession, loginPost, logoutManually } from "@/rest/authenticationRequests";
import { setNavigate } from "@/rest/loader.ts";

export interface IUseProvideAuth {
  loginState: LoginState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useProvideAuth(): IUseProvideAuth {
  const [loginState, setLoginState] = useState(LoginState.UNKNOWN);

  const navigate = useNavigate();
  const location = useLocation();
  setNavigate(navigate);

  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    try {
      setLoginState(LoginState.LOGGED_OUT);
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

  const login = useCallback(
    async (username: string, password: string) => {
      setLoginState(LoginState.PENDING);
      try {
        await loginPost(username, password);
        setLoginState(LoginState.LOGGED_IN);
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          if (!location.pathname.startsWith("/login")) {
            window.location.reload();
          }
          setLoginState(LoginState.CREDENTIALS_INVALID);
        } else {
          await logout();
        }
      }
    },
    [location.pathname, logout],
  );

  useEffect(() => {
    async function bootstrap() {
      if (loginState !== LoginState.UNKNOWN) {
        return;
      }
      const ok = await checkSession();
      if (ok) {
        setLoginState(LoginState.LOGGED_IN);
      } else {
        setLoginState(LoginState.LOGGED_OUT);
      }
    }
    bootstrap();
  }, [loginState]);

  return useMemo(
    () => ({
      loginState,
      login,
      logout,
    }),
    [loginState, login, logout],
  );
}
