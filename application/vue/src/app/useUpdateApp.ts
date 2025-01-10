import { useRegisterSW } from "virtual:pwa-register/react";
import noop from "lodash/fp/noop";

export default function useUpdateApp() {
  useRegisterSW({
    onRegisteredSW(_, r) {
      r &&
        setInterval(
          () => {
            r.update().catch(noop);
          },
          60 * 60 * 1000, // one minute
        );
    },
  });
}
