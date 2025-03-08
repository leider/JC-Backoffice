import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { Navigate } from "react-router";
import * as React from "react";
import { JSX, useMemo } from "react";
import map from "lodash/map";
import some from "lodash/some";
import identity from "lodash/identity";

export default function ProtectedComponent({
  allowed,
  component,
}: {
  readonly allowed: ("isOrgaTeam" | "isAbendkasse" | "isSuperuser")[];
  readonly component: JSX.Element;
}) {
  const { currentUser } = useJazzContext();
  const showComp = some(
    map(allowed, (each) => {
      return currentUser.id ? currentUser.accessrights[each] : true;
    }),
    identity,
  );
  const forwardTo = useMemo(
    () => (currentUser.accessrights.isOrgaTeam ? "/veranstaltungen" : "/team"),
    [currentUser.accessrights.isOrgaTeam],
  );
  return showComp ? component : <Navigate replace to={{ pathname: forwardTo }} />;
}
