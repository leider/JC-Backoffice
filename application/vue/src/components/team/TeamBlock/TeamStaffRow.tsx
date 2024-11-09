import { Tag, theme } from "antd";
import React, { useContext, useMemo } from "react";
import { addOrRemoveUserToSection } from "@/commons/loader.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import { ButtonStaff } from "@/components/team/TeamBlock/ButtonStaff.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { ErsthelferSymbol } from "@/widgets/ErsthelferSymbol.tsx";

interface TeamStaffRowProps {
  sectionName: StaffType;
  veranstaltung: Veranstaltung;
}

export function ActiveUsers({ sectionName, veranstaltung }: TeamStaffRowProps) {
  const { usersAsOptions } = useContext(TeamContext);

  const { useToken } = theme;
  const token = useToken().token;
  const staffCollection = useMemo(() => veranstaltung.staff.getStaffCollection(sectionName), [sectionName, veranstaltung.staff]);

  const usersWithKann = useMemo(
    () => usersAsOptions.filter((user) => staffCollection.includes(user.value)),
    [staffCollection, usersAsOptions],
  );

  const { currentUser } = useJazzContext();

  function ersthelfer(userWithKann: UserWithKann) {
    return userWithKann?.kann.includes("Ersthelfer");
  }

  return usersWithKann.length > 0 ? (
    usersWithKann.map((user) => {
      const isCurrentUser = user.label === currentUser.name;
      return (
        <Tag color={isCurrentUser ? token.colorSuccess : undefined} key={user.value}>
          <span>
            {user.label}
            {ersthelfer(user) && <ErsthelferSymbol inverted={isCurrentUser} />}
          </span>
        </Tag>
      );
    })
  ) : (
    <span>Hier könnten wir Dich brauchen...</span>
  );
}

export function AddRemoveStaffButton({
  sectionName,
  veranstaltung,
  staffUpdated,
}: TeamStaffRowProps & { staffUpdated: (veranst: Veranstaltung) => void }) {
  const { currentUser } = useJazzContext();

  const isIn = useMemo(
    () => veranstaltung.staff.getStaffCollection(sectionName).includes(currentUser.id),
    [currentUser.id, sectionName, veranstaltung.staff],
  );

  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: async (add: boolean) => addOrRemoveUserToSection(veranstaltung, sectionName, add),
    onSuccess: (data) => {
      if (veranstaltung.isVermietung) {
        queryClient.invalidateQueries({ queryKey: ["vermietung"] });
        staffUpdated(new Vermietung(data));
      } else {
        queryClient.invalidateQueries({ queryKey: ["konzert"] });
        staffUpdated(new Konzert(data));
      }
    },
  });

  return isIn ? (
    <ButtonStaff
      add={false}
      callback={async function () {
        mutate.mutate(false);
      }}
    />
  ) : (
    <ButtonStaff
      add={true}
      callback={async function () {
        mutate.mutate(true);
      }}
    />
  );
}
