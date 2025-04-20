import { Form, Select } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import OptionValues, { Preisprofil } from "jc-shared/optionen/optionValues";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import find from "lodash/find";
import map from "lodash/map";
import sortBy from "lodash/sortBy";

interface PreisprofilSelectParams {
  readonly optionen: OptionValues;
  readonly onChange?: (value?: Preisprofil) => void;
}

export default function PreisprofilSelect({ optionen, onChange }: PreisprofilSelectParams) {
  const form = useFormInstance();
  return (
    <Form.Item
      label={<b style={{ whiteSpace: "nowrap" }}>Preisprofil:</b>}
      name={["eintrittspreise", "preisprofil"]}
      trigger="onValueAsObject"
      valuePropName="valueAsObject"
    >
      <InternalPreisprofilSelect disabled={form.getFieldValue(["kasse", "kassenfreigabe"])} onChange={onChange} optionen={optionen} />
    </Form.Item>
  );
}

interface InternalPreisprofilSelectParams {
  readonly id?: string;
  readonly valueAsObject?: Preisprofil;
  readonly optionen: OptionValues;
  readonly onValueAsObject?: (value?: Preisprofil) => void;
  readonly onChange?: (value?: Preisprofil) => void;
  readonly disabled: boolean;
}

function InternalPreisprofilSelect({ id, onValueAsObject, optionen, valueAsObject, onChange, disabled }: InternalPreisprofilSelectParams) {
  function profilToDisplay(profil: Preisprofil) {
    return {
      label: (
        <span>
          {profil.name} {profil.veraltet ? "(Nicht aktuell)" : ""}
          <small>
            &nbsp;
            {`(${profil.regulaer},00, ${profil.regulaer - profil.rabattErmaessigt},00, ${profil.regulaer - profil.rabattMitglied},00)`}
          </small>
        </span>
      ),
      value: profil.name,
    };
  }

  const alleProfile = useMemo<Preisprofil[]>(() => {
    const result = [...optionen.preisprofile];
    if (valueAsObject && !find(optionen.preisprofile, { name: valueAsObject.name })) {
      result.push({ ...valueAsObject, veraltet: true });
    }
    return sortBy(result, "regulaer");
  }, [optionen, valueAsObject]);

  const displayProfile = useMemo(() => {
    return map(alleProfile, profilToDisplay);
  }, [alleProfile]);

  const [valueAsString, setValueAsString] = useState<string | undefined>();
  useEffect(() => {
    setValueAsString(valueAsObject?.name);
  }, [valueAsObject]);

  const selectedToPreisprofil = useCallback(
    (profilName: string) => {
      const selectedProfil = find(alleProfile, { name: profilName });
      onValueAsObject?.(selectedProfil);
      onChange?.(selectedProfil);
    },
    [alleProfile, onValueAsObject, onChange],
  );

  return <Select disabled={disabled} id={id} onSelect={selectedToPreisprofil} options={displayProfile} value={valueAsString} />;
}
