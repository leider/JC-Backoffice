import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { Button, Dropdown, FormInstance, Space } from "antd";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { alleKalender } from "@/commons/loader.ts";
import Kalender from "jc-shared/programmheft/kalender.ts";
import { useWatch } from "antd/es/form/Form";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";

export default function ProgrammheftKopierenButton({ form }: { form: FormInstance<Kalender> }) {
  const { data } = useQuery({
    queryKey: ["kalender", "alle"],
    queryFn: () => alleKalender(),
  });

  const id = useWatch("id", { form, preserve: true });

  const options = useMemo(() => {
    return (data ?? []).filter((kalender) => kalender.id !== id && kalender.events.length);
  }, [data, id]);

  const items = useMemo(() => {
    return options.map((kal) => {
      const label = DatumUhrzeit.forYYYYslashMM(kal.id).monatJahrKompakt;
      return { key: kal.id, label };
    });
  }, [options]);

  const copyFromPrevious = useCallback(
    async (key: string) => {
      const prevKal = options.find((kalender) => kalender.id === key);
      if (prevKal) {
        form.setFieldValue("events", prevKal.eventsMovedWithBase(id));
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
          Anlegen wie <IconForSmallBlock size="10" iconName="ChevronDown" />
        </Space>
      </Button>
    </Dropdown>
  );
}
