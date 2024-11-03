import React, { createContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserWithKann } from "@/components/team/MitarbeiterMultiSelect.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { TeamUndVeranstaltungen } from "@/components/team/TeamUndVeranstaltungen.tsx";

export const TeamContext = createContext<{
  veranstaltungenNachMonat: {
    [index: string]: Veranstaltung[];
  };
  usersAsOptions: UserWithKann[];
}>({ veranstaltungenNachMonat: {}, usersAsOptions: [] });

export default function Veranstaltungen() {
  useDirtyBlocker(false);
  document.title = "Veranstaltungen";

  const { currentUser } = useJazzContext();

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const accessrights = currentUser.accessrights;
    if (currentUser.id && location.pathname !== "/team" && !accessrights.isOrgaTeam) {
      navigate("/team");
    }
  }, [currentUser.accessrights, currentUser.id, location.pathname, navigate]);

  return <TeamUndVeranstaltungen periodsToShow={["zukuenftige", "vergangene", "alle"]} />;
}
