import type { FC } from "react";
import React, { useEffect, useState } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { BoxParams, Rider } from "jc-shared/rider/rider.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { riderFor, saveRider } from "@/loader.ts";
import { RiderComp } from "jc-vue/src/components/rider/RiderComp.tsx";
import ButtonWithIcon from "../../vue/src/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { theme } from "antd";

export const RiderStandalone: FC = () => {
  const url = window.location.pathname.replace("/rider/", "");

  const queryClient = useQueryClient();
  const [targetBoxes, setTargetBoxes] = useState<BoxParams[]>([]);
  const [rider, setRider] = useState<Rider>(new Rider());

  const { data, isSuccess } = useQuery({ queryKey: ["rider", "url"], queryFn: () => riderFor(url || "") });
  const mutateRider = useMutation({
    mutationFn: saveRider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider", url] });
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      setRider(data);
      setTargetBoxes(data.boxes);
    }
  }, [data, isSuccess]);

  function save() {
    rider.boxes = targetBoxes;
    mutateRider.mutate(rider);
  }
  const { useToken } = theme;
  const token = useToken().token;

  return (
    <>
      <PageHeader
        title="Rider"
        extra={
          isSuccess && [
            <ButtonWithIcon
              key="save"
              text="Speichern"
              icon="CheckSquare"
              disabled={!isSuccess}
              color={token.colorSuccess}
              onClick={save}
            />,
          ]
        }
      />
      {isSuccess ? (
        <RiderComp targetBoxes={targetBoxes} setTargetBoxes={setTargetBoxes} />
      ) : (
        <h1>
          Falsche Daten oder Link abgelaufen - <small>Bitte URL prüfen</small>
        </h1>
      )}
    </>
  );
};
