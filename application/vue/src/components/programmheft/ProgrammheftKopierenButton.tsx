import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { Button, Dropdown, Space } from "antd";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { alleKalender } from "@/rest/loader.ts";
import { useWatch } from "antd/es/form/Form";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import find from "lodash/find";
import map from "lodash/map";
import filter from "lodash/filter";

export default function ProgrammheftKopierenButton() {
  const form = useFormInstance();

  const { data } = useQuery({
    queryKey: ["kalender", "alle"],
    queryFn: () => alleKalender(),
  });

  const id = useWatch("id", { form, preserve: true });

  const options = useMemo(() => {
    return filter(data, (kalender) => kalender.id !== id && !!kalender.events.length);
  }, [data, id]);

  const items = useMemo(() => {
    return map(options, (kal) => ({ key: kal.id, label: DatumUhrzeit.forYYYYslashMM(kal.id).monatJahrKompakt }));
  }, [options]);

  const copyFromPrevious = useCallback(
    async (key: string) => {
      const prevKal = find(options, { id: key });
      if (prevKal) {
        const events = prevKal.eventsMovedWithBase(id);
        form.setFieldValue("events", events);
      }
    },
    [form, id, options],
  );

  function onMenuClick({ key }: { key: string }): void {
    copyFromPrevious(key);
  }

  return (
    <Dropdown menu={{ items, onClick: onMenuClick }}>
      <Button type="default">
        <Space>
          Anlegen wie <IconForSmallBlock iconName="ChevronDown" size="10" />
        </Space>
      </Button>
    </Dropdown>
  );
}
