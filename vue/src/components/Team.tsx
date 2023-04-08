import React, { useEffect, useState } from "react";
import { allUsers, veranstaltungenForTeam } from "@/commons/loader-for-react";
import User from "jc-shared/user/user";
import { useQueries } from "@tanstack/react-query";
import { Row, Typography } from "antd";
import VeranstaltungComp from "@/components/TeamBlockAdmin";

const { Title } = Typography;

interface UserCompProps {
  user: User;
}

function UserComp({ user }: UserCompProps) {
  return <p>{user.name}</p>;
}

function Team() {
  const [users, veranstaltungen] = useQueries({
    queries: [
      {
        queryKey: ["users"],
        queryFn: allUsers,
      },
      {
        queryKey: ["veranstaltungen"],
        queryFn: () => veranstaltungenForTeam("alle"),
      },
    ],
  });
  const [usersAsOptions, setUsersAsOptions] = useState<{ label: string; value: string }[] | undefined>([]);
  useEffect(() => {
    console.log("EFFECT");
    setUsersAsOptions(users.data?.map((user) => ({ label: user.id, value: user.id })));
  }, [users.data]);

  return (
    <>
      <h1>JAZZCLUB in REACT</h1>
      <p>Text</p>
      <Row gutter={8}>
        {veranstaltungen.data?.map((veranstaltung, index) => (
          <VeranstaltungComp key={index} veranstaltung={veranstaltung} usersAsOptions={usersAsOptions || []} initiallyOpen={false} />
        ))}
      </Row>
      {users.data?.map((user, index) => (
        <UserComp key={index} user={user}></UserComp>
      ))}
    </>
  );
}

export default Team;
