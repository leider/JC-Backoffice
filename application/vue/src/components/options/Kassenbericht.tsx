import * as React from "react";
import { useEffect, useState } from "react";
import { Col } from "antd";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function Kassenbericht() {
  useDirtyBlocker(false);
  const [monate, setMonate] = useState<DatumUhrzeit[]>([]);

  document.title = "Kassenbericht";

  useEffect(() => {
    const result: DatumUhrzeit[] = [];
    let current = new DatumUhrzeit().minus({ monate: 6 });
    for (let i = 0; i < 12; i++) {
      result.push(current);
      current = current.plus({ monate: 1 });
    }
    setMonate(result);
  }, []);

  return (
    <>
      <JazzPageHeader title="Kassenberichte" />
      <RowWrapper>
        <JazzRow>
          <Col span={24}>
            {map(monate, (monat) => (
              <p key={monat.monatJahrKompakt}>
                <a href={"/pdf/kassenbericht/" + monat.fuerKalenderViews} target="_blank" rel="noreferrer">
                  Kassenbericht {monat.monatJahrKompakt}
                </a>
              </p>
            ))}
          </Col>
        </JazzRow>
      </RowWrapper>
    </>
  );
}
