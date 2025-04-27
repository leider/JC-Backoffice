import { createContext } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";

export const TeamContext = createContext<{
  veranstaltungenNachMonat: {
    [index: string]: Veranstaltung[];
  };
  usersAsOptions: UserWithKann[];
  period: string;
}>({ veranstaltungenNachMonat: {}, usersAsOptions: [], period: "zukuenftige" });
