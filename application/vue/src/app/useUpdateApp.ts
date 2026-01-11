import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import noop from "lodash/noop";

export default function useUpdateApp() {
  const intervalIdRef = useRef<number | null>(null);
  const reloadingRef = useRef(false);

  useEffect(() => {
    // Reload once when a new SW takes control of this page. [web:92]
    const onControllerChange = () => {
      if (!reloadingRef.current) {
        reloadingRef.current = true;
        window.location.reload();
      }
    };

    navigator.serviceWorker?.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  useRegisterSW({
    // autoUpdate flow: no prompt needed; updates take control via skipWaiting/clientsClaim. [web:83]
    onRegisteredSW(_, r) {
      if (!r) return;

      // Avoid stacking intervals if React remounts this hook. [web:92]
      if (intervalIdRef.current !== null) window.clearInterval(intervalIdRef.current);

      // Detect that an update was found and progressed to "installed". [web:129]
      const onUpdateFound = () => {
        const installing = r.installing;
        if (!installing) return;

        const onStateChange = () => {
          // "installed" means: new SW is ready (either first install or update). [web:129]
          if (installing.state === "installed") {
            // Only treat as an update if there was already a controller (i.e., not the first install). [web:92]
            if (navigator.serviceWorker?.controller) {
              // In autoUpdate, skipWaiting/clientsClaim should make the new SW take control,
              // which then triggers controllerchange and reload via the listener above. [web:83]
            }
          }
        };

        installing.addEventListener("statechange", onStateChange);
      };

      r.addEventListener("updatefound", onUpdateFound);

      intervalIdRef.current = window.setInterval(() => {
        r.update().catch(noop);
      }, 60 * 1000);

      // Cleanup when re-registered/unmounted. [web:92]
      return () => {
        r.removeEventListener("updatefound", onUpdateFound);
        if (intervalIdRef.current !== null) {
          window.clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      };
    },
  });
}
