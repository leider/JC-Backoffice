import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { TeamUndVeranstaltungen } from "@/components/team/TeamUndVeranstaltungen.tsx";

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
