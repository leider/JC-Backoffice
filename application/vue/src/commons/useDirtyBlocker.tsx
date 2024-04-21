import { useCallback, useEffect } from "react";
import { Blocker, BlockerFunction } from "react-router";
import { useBlocker } from "react-router-dom";
import { App } from "antd";

export function useDirtyBlocker(dirty: boolean) {
  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname,
    [dirty],
  );
  const blocker: Blocker = useBlocker(shouldBlock);
  const { modal } = App.useApp();

  const showModal = useCallback(() => {
    modal.confirm({
      title: "Änderungen gefunden",
      content: "Willst Du Deine Änderungen verwerfen?",
      onOk: () => {
        blocker.reset?.();
      },
      onCancel: () => {
        blocker.proceed?.();
      },
      cancelText: "Ja, verwerfen",
      okText: "Nein, ich will zurück",
    });
  }, [blocker, modal]);

  useEffect(() => {
    if (dirty && blocker.state === "blocked") {
      showModal();
    }
  }, [blocker.state, dirty, showModal]);
}
