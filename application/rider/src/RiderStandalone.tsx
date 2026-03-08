import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BoxParams } from "jc-shared/rider/rider.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { riderFor, saveRider } from "@/loader.ts";
import { RiderComp } from "jc-vue/src/components/rider/RiderComp.tsx";
import ButtonWithIcon from "jc-vue/src/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { Flex, theme, Typography } from "antd";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";

const titel = "Jazzclub Konzert";

export function RiderStandalone() {
  const url = window.location.pathname.replace("/rider/", "");
  // eslint-disable-next-line react-hooks/immutability
  document.title = titel;
  const queryClient = useQueryClient();
  const [targetBoxes, setTargetBoxes] = useState<BoxParams[]>([]);

  const { data: rider, isSuccess } = useQuery({ queryKey: ["rider", "url"], queryFn: () => riderFor(url || "") });
  const mutateRider = useMutation({
    mutationFn: saveRider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider", url] });
    },
  });

  const start = useMemo(() => (rider ? DatumUhrzeit.forJSDate(rider.startDate).tagMonatJahrLang : ""), [rider]);

  useEffect(() => {
    if (isSuccess && rider) {
      setTargetBoxes(rider.boxes);
    }
  }, [rider, isSuccess]);

  const save = useCallback(() => {
    if (rider) {
      // eslint-disable-next-line react-hooks/immutability
      rider.boxes = targetBoxes;
      mutateRider.mutate(rider);
    }
  }, [mutateRider, rider, targetBoxes]);

  const token = theme.useToken().token;

  return (
    <>
      <Flex justify="space-between" wrap>
        <Typography.Title level={1} style={{ margin: "0px 12px 0px 0px" }}>
          <span>{`Rider für "${titel}" am ${start}`}</span>
        </Typography.Title>
      </Flex>
      <span>
        <div className="ant-space-gap-row-small ant-space-gap-col-small" style={{ display: "inline-flex", whiteSpace: "unset" }}>
          <ButtonWithIcon color={token.colorSuccess} disabled={!isSuccess} icon="CheckSquare" key="save" onClick={save} text="Speichern" />
        </div>
      </span>
      {isSuccess ? (
        <RiderComp setTargetBoxes={setTargetBoxes} targetBoxes={targetBoxes} />
      ) : (
        <h1>
          Falsche Daten oder Link abgelaufen - <small>Bitte URL prüfen</small>
        </h1>
      )}
    </>
  );
}
