import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BoxParams } from "jc-shared/rider/rider.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { riderFor, saveRider } from "@/loader.ts";
import { RiderComp } from "jc-vue/src/components/rider/RiderComp.tsx";
import ButtonWithIcon from "jc-vue/src/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { theme } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";

const titel = "Jazzclub Konzert";

export function RiderStandalone() {
  const url = window.location.pathname.replace("/rider/", "");
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
      rider.boxes = targetBoxes;
      mutateRider.mutate(rider);
    }
  }, [mutateRider, rider, targetBoxes]);

  const token = theme.useToken().token;

  return (
    <>
      <PageHeader
        extra={[
          <ButtonWithIcon color={token.colorSuccess} disabled={!isSuccess} icon="CheckSquare" key="save" onClick={save} text="Speichern" />,
        ]}
        title={`Rider für "${titel}" am ${start}`}
      />
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
