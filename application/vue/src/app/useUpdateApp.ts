import { useRegisterSW } from "virtual:pwa-register/react";
import noop from "lodash/noop";

export default function useUpdateApp() {
  useRegisterSW({
    onNeedRefresh: window.location.reload,
    onRegisteredSW(_, r) {
      r &&
        setInterval(
          () => {
            r.update().catch(noop);
          },
          60 * 1000, // one minute
        );
    },
  });
}
