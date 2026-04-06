import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { LoginState, useAuth } from "@/commons/authConsts.ts";
import { Navigate } from "react-router";
import * as React from "react";
import { JSX, useMemo } from "react";
import map from "lodash/map";
import some from "lodash/some";
import identity from "lodash/identity";
import { Spin } from "antd";

export default function ProtectedComponent({
  allowed,
  component,
}: {
  readonly allowed: ("isOrgaTeam" | "isAbendkasse" | "isSuperuser")[];
  readonly component: JSX.Element;
}) {
  const { currentUser } = useJazzContext();
  const { loginState } = useAuth();

  const forwardTo = useMemo(
    () => (currentUser.id && currentUser.accessrights.isOrgaTeam ? "/veranstaltungen" : "/team"),
    [currentUser.accessrights.isOrgaTeam, currentUser.id],
  );

  if (loginState === LoginState.LOGGED_IN && !currentUser.id) {
    return <Spin size="large" />;
  }

  const showComp =
    !!currentUser.id &&
    some(
      map(allowed, (each) => currentUser.accessrights[each]),
      identity,
    );

  return showComp ? component : <Navigate replace to={{ pathname: forwardTo }} />;
}
