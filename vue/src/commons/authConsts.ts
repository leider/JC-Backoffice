import { createContext, useContext } from "react";
import { IUseProvideAuth } from "@/commons/auth.tsx";
import User from "jc-shared/user/user.ts";

/**
 * The different login states the user can be in.
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
export const AuthContext = createContext<IUseProvideAuth>({
  context: { currentUser: new User({}), wikisubdirs: { dirs: [] } },
  loginState: LoginState.UNKNOWN,
  login: async () => {},
  logout: async () => {},
});

/**
 * Hook for child components to get the auth object
 * and re-render when it changes.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
