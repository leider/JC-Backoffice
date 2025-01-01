import { useRegisterSW } from "virtual:pwa-register/react";

export default function useUpdateApp() {
  useRegisterSW({
    onRegisteredSW(_, r) {
      r &&
        setInterval(
          () => {
            r.update().catch(() => {
              // IGNORE console.log(oops);
            });
          },
          60 * 60 * 1000, // one minute
        );
    },
  });
}
