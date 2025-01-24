import { createContext, useContext, useEffect, useMemo, useState } from "react";
import User from "jc-shared/user/user.ts";
import { useQueries } from "@tanstack/react-query";
import { allUsers, currentUser, konzerteForToday, optionen as optionenLoader, orte as orteLoader, wikisubdirs } from "@/commons/loader.ts";
import { LoginState } from "@/commons/authConsts.ts";
import { IUseProvideAuth } from "@/commons/auth.tsx";
import { RouterContext } from "@/router/RouterContext.ts";
import OptionValues from "jc-shared/optionen/optionValues.ts";
import Orte from "jc-shared/optionen/orte.ts";
import { App } from "antd";
import { TeamFilterObject } from "@/components/team/TeamFilter/applyTeamFilter.ts";
import noop from "lodash/noop";
import Konzert from "jc-shared/konzert/konzert.ts";
import { GlobalContext } from "@/app/GlobalContext.ts";

const emptyContext: SharedGlobals = {
  currentUser: new User({}),
  wikisubdirs: [],
  allUsers: [],
  optionen: new OptionValues(),
  orte: new Orte(),
  todayKonzerte: [],
  showSuccess: noop,
  showError: noop,
  filter: {},
  setFilter: noop,
  isDirty: false,
  setIsDirty: noop,
  setMemoizedId: noop,
  isDarkMode: false,
  isCompactMode: false,
};

type SharedGlobals = {
  currentUser: User;
  wikisubdirs: string[];
  allUsers: User[];
  optionen: OptionValues;
  orte: Orte;
  todayKonzerte: Konzert[];
  showSuccess: ({ text, title, duration }: { duration?: number; text?: React.ReactNode; title?: string }) => void;
  showError: ({ text, title, closeCallback }: { text?: string; title?: string; closeCallback?: () => void }) => void;
  filter: TeamFilterObject;
  setFilter: (filter: TeamFilterObject) => void;
  isDirty: boolean;
  setIsDirty: (a: boolean) => void;
  memoizedId?: string;
  setMemoizedId: (id?: string) => void;
  isDarkMode: boolean;
  isCompactMode: boolean;
};
export const JazzContext = createContext<SharedGlobals>(emptyContext);

export function useCreateJazzContext(auth: IUseProvideAuth): SharedGlobals {
  const { loginState } = auth;
  const { setCurrentUser } = useContext(RouterContext);
  const { isDarkMode, isCompactMode } = useContext(GlobalContext);
  const isAuthenticated = useMemo(() => loginState === LoginState.LOGGED_IN, [loginState]);

  const refetchInterval = 30 * 60 * 1000; // 30 minutes

  const [filter, setFilter] = useState<TeamFilterObject>({});
  const [isDirty, setIsDirty] = useState(false);
  const [memoizedId, setMemoizedId] = useState<string | undefined>();

  const context: Omit<
    SharedGlobals,
    | "showSuccess"
    | "showError"
    | "filter"
    | "setFilter"
    | "isDirty"
    | "setIsDirty"
    | "memoizedId"
    | "setMemoizedId"
    | "isDarkMode"
    | "isCompactMode"
  > = useQueries({
    queries: [
      { enabled: isAuthenticated, queryKey: ["users"], queryFn: () => allUsers(), refetchInterval },
      { enabled: isAuthenticated, queryKey: ["wikidirs"], queryFn: () => wikisubdirs(), refetchInterval },
      { enabled: isAuthenticated, queryKey: ["currentUser"], queryFn: () => currentUser(), refetchInterval },
      { enabled: isAuthenticated, queryKey: ["optionen"], queryFn: () => optionenLoader(), refetchInterval },
      { enabled: isAuthenticated, queryKey: ["orte"], queryFn: () => orteLoader(), refetchInterval },
      { enabled: isAuthenticated, queryKey: ["konzert", "today"], queryFn: () => konzerteForToday() },
    ],
    combine: ([usersQuery, wikidirsQuery, currentQuery, optionenQuery, orteQuery, todayQuery]) => {
      if (usersQuery?.data && wikidirsQuery?.data && currentQuery?.data && optionenQuery?.data && orteQuery?.data && todayQuery?.data) {
        return {
          allUsers: usersQuery.data,
          wikisubdirs: wikidirsQuery.data.dirs,
          currentUser: currentQuery.data,
          optionen: optionenQuery.data,
          orte: orteQuery.data,
          todayKonzerte: todayQuery.data,
        };
      }
      return emptyContext;
    },
  });
  const { notification } = App.useApp();

  function showSuccess({
    text = "Die Änderungen wurden gespeichert",
    title = "Speichern erfolgreich",
    duration = 3,
  }: {
    duration?: number;
    text?: React.ReactNode;
    title?: string;
  }) {
    notification.success({
      message: title,
      description: text,
      placement: "bottom",
      showProgress: true,
      duration: duration,
    });
  }

  function showError({
    text = "Etwas ist schiefgegangen",
    title = "Problem",
    closeCallback,
  }: {
    text?: string;
    title?: string;
    closeCallback?: () => void;
  }) {
    notification.error({
      message: title,
      description: text,
      placement: "bottom",
      duration: 10,
      showProgress: true,

      onClose: closeCallback,
    });
  }

  const exposedContext = useMemo(() => (isAuthenticated ? context : emptyContext), [context, isAuthenticated]);

  useEffect(() => {
    setCurrentUser(exposedContext.currentUser);
  }, [exposedContext.currentUser, setCurrentUser]);

  return {
    ...exposedContext,
    showSuccess,
    showError,
    filter,
    setFilter,
    isDirty,
    setIsDirty,
    memoizedId,
    setMemoizedId,
    isDarkMode,
    isCompactMode,
  };
}

export function useJazzContext() {
  return useContext(JazzContext);
}
