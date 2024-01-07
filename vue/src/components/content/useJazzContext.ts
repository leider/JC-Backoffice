import { createContext, useContext, useEffect, useMemo } from "react";
import User from "jc-shared/user/user.ts";
import { useQueries } from "@tanstack/react-query";
import { allUsers, currentUser, optionen as optionenLoader, orte as orteLoader, wikisubdirs } from "@/commons/loader.ts";
import { LoginState } from "@/commons/authConsts.ts";
import { IUseProvideAuth } from "@/commons/auth.tsx";
import { RouterContext } from "@/router/JazzRouter.tsx";
import OptionValues from "jc-shared/optionen/optionValues.ts";
import Orte from "jc-shared/optionen/orte.ts";
import { App } from "antd";

const emptyContext = {
  currentUser: new User({}),
  wikisubdirs: [],
  allUsers: [],
  optionen: new OptionValues(),
  orte: new Orte(),
  showSuccess: () => {},
};

type SharedGlobals = {
  currentUser: User;
  wikisubdirs: string[];
  allUsers: User[];
  optionen: OptionValues;
  orte: Orte;
  showSuccess: ({ text, title }: { text?: string; title?: string }) => void;
};
export const JazzContext = createContext<SharedGlobals>(emptyContext);

export function useCreateJazzContext(auth: IUseProvideAuth): SharedGlobals {
  const { loginState } = auth;
  const { setCurrentUser } = useContext(RouterContext);
  const isAuthenticated = useMemo(() => loginState === LoginState.LOGGED_IN, [loginState]);
  const context: Omit<SharedGlobals, "showSuccess"> = useQueries({
    queries: [
      { enabled: isAuthenticated, queryKey: ["users"], queryFn: () => allUsers() },
      { enabled: isAuthenticated, queryKey: ["wikidirs"], queryFn: () => wikisubdirs() },
      { enabled: isAuthenticated, queryKey: ["currentUser"], queryFn: () => currentUser() },
      { enabled: isAuthenticated, queryKey: ["optionen"], queryFn: () => optionenLoader() },
      { enabled: isAuthenticated, queryKey: ["orte"], queryFn: () => orteLoader() },
    ],
    combine: ([usersQuery, wikidirsQuery, currentQuery, optionenQuery, orteQuery]) => {
      if (usersQuery?.data && wikidirsQuery?.data && currentQuery?.data && optionenQuery?.data && orteQuery?.data) {
        return {
          allUsers: usersQuery.data,
          currentUser: currentQuery.data,
          wikisubdirs: wikidirsQuery.data.dirs,
          optionen: optionenQuery.data,
          orte: orteQuery.data,
        };
      }
      return emptyContext;
    },
  });
  const { notification } = App.useApp();

  function showSuccess({ text = "Die Änderungen wurden gespeichert", title = "Speichern erfolgreich" }) {
    notification.success({
      message: title,
      description: text,
      placement: "topLeft",
      duration: 3,
    });
  }

  useEffect(() => {
    setCurrentUser(context.currentUser);
  }, [context.currentUser, setCurrentUser]);

  return { ...context, showSuccess };
}

export function useJazzContext() {
  return useContext(JazzContext);
}
