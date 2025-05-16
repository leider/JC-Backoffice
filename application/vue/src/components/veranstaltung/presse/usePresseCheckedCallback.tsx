import { useCallback } from "react";
import { App, CheckboxProps } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import ModalContentForCallback from "@/components/veranstaltung/presse/ModalContentForCallback.tsx";

export function usePresseCheckedCallback(isVermietung: boolean) {
  const { modal } = App.useApp();
  const form = useFormInstance<Veranstaltung>();

  const presseChecked: CheckboxProps["onChange"] = useCallback(
    (e: CheckboxChangeEvent) => {
      const checked = e.target.checked;
      if (checked) {
        const verForPreview = isVermietung ? new Vermietung(form.getFieldsValue(true)) : new Konzert(form.getFieldsValue(true));

        modal.info({
          title: "Bitte kurz nochmal den Text und das Layout prüfen.",
          content: <ModalContentForCallback verForPreview={verForPreview} />,
          width: "80vw",
        });
      }
    },
    [form, isVermietung, modal],
  );

  return { presseChecked };
}
