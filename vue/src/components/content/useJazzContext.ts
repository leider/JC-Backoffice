import { createContext, useContext, useMemo } from "react";
import User from "jc-shared/user/user.ts";
import { useQueries } from "@tanstack/react-query";
import { allUsers, currentUser, wikisubdirs } from "@/commons/loader.ts";
import { LoginState, useAuth } from "@/commons/authConsts.ts";

const emptyContext = { currentUser: new User({}), wikisubdirs: [], allUsers: [] };

type SharedGlobals = {
  currentUser: User;
  wikisubdirs: string[];
  allUsers: User[];
};
export const JazzContext = createContext<SharedGlobals>(emptyContext);

export function useCreateJazzContext(): SharedGlobals {
  const { loginState } = useAuth();
  const isAuthenticated = useMemo(() => loginState === LoginState.LOGGED_IN, [loginState]);
  const [usersQuery, wikidirsQuery, currentQuery] = useQueries({
    queries: [
      { enabled: isAuthenticated, queryKey: ["users"], queryFn: () => allUsers() },
      { enabled: isAuthenticated, queryKey: ["wikidirs"], queryFn: () => wikisubdirs() },
      { enabled: isAuthenticated, queryKey: ["currentUser"], queryFn: () => currentUser() },
    ],
  });

  const users = useMemo(() => usersQuery.data || [], [usersQuery.data]);

  const wiki = useMemo(() => wikidirsQuery.data?.dirs || [], [wikidirsQuery.data]);

  const current = useMemo(() => currentQuery.data || new User({}), [currentQuery.data]);

  return { allUsers: users, currentUser: current, wikisubdirs: wiki };
}

export function useJazzContext() {
  return useContext(JazzContext);
}
