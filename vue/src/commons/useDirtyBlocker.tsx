import { useCallback, useEffect } from "react";
import { Blocker, BlockerFunction } from "react-router";
import { useBlocker } from "react-router-dom";
import { App } from "antd";

export function useDirtyBlocker(dirty: boolean, checkPathnameOnly = false) {
  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) => {
      return dirty && (checkPathnameOnly ? currentLocation.pathname !== nextLocation.pathname : true);
    },
    [checkPathnameOnly, dirty],
  );
  const blocker: Blocker = useBlocker(shouldBlock);
  const { modal } = App.useApp();

  useEffect(() => {
    if (dirty && blocker.state === "blocked") {
      modal.confirm({
        title: "Änderungen gefunden",
        content: "Willst Du Deine Änderungen verwerfen?",
        onOk: () => {
          blocker.reset();
        },
        onCancel: () => {
          blocker.proceed();
        },
        cancelText: "Ja, verwerfen",
        okText: "Nein, ich will zurück",
      });
    }
  }, [blocker, dirty, modal]);
}
