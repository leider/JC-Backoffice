import { useJazzContext } from "@/components/content/useJazzContext.ts";
import React, { useEffect, useState } from "react";
import { Form } from "antd";
import User from "jc-shared/user/user.ts";
import { IchKannFields } from "@/components/users/UserModals.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveUser } from "@/commons/loader.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import isNil from "lodash/isNil";
import { JazzModal } from "@/widgets/JazzModal.tsx";

export function TellUserToFillHelpFields() {
  const { currentUser } = useJazzContext();
  const [form] = Form.useForm<User>();

  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const mutateUser = useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsOpen(false);
    },
  });

  useEffect(() => {
    if (currentUser.id) {
      if (currentUser.hatKeineKannsGefuellt || isNil(currentUser.kannErsthelfer)) {
        const deepCopy = currentUser.toJSONWithoutPass();
        form.setFieldsValue(deepCopy);
        setIsOpen(true);
      }
    }
  }, [currentUser, form]);

  function saveForm() {
    form.validateFields().then(async () => {
      mutateUser.mutate(new User(form.getFieldsValue(true)));
    });
  }

  return (
    <JazzModal
      open={isOpen}
      cancelButtonProps={{ type: "text" }}
      cancelText=" "
      okText="Danke"
      onOk={saveForm}
      closable={false}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <JazzPageHeader title="Kleine Bitte" />
        {isNil(currentUser.kannErsthelfer) && (
          <p>
            <b>Ersthelfer gesucht!</b>
          </p>
        )}

        <p>Bitte sag uns kurz, in welchen Bereichen Du helfen kannst und willst...</p>
        <IchKannFields form={form} />
        <em>
          Damit wir erkennen, dass Du nichts ankreuzen willst, musst Du einmal etwas an- und wieder abwählen; sonst kommt der Dialog beim
          nächsten Mal wieder.
        </em>
      </Form>
    </JazzModal>
  );
}
