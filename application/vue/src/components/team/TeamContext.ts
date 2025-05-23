import { createContext } from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";

// eslint-disable-next-line lodash/prefer-constant
const calcHeight = () => {
  return 5;
};

export const TeamContext = createContext<{
  alleErsthelfer: string[];
  veranstaltungenNachMonat: {
    [index: string]: Veranstaltung[];
  };
  usersAsOptions: UserWithKann[];
  period: string;
  noOfVeranstaltungen: number;
  calcHeight: ({ expanded, isAdmin, veranstaltung }: { expanded: boolean; isAdmin: boolean; veranstaltung: Veranstaltung }) => number;
}>({
  veranstaltungenNachMonat: {},
  usersAsOptions: [],
  period: "zukuenftige",
  calcHeight,
  noOfVeranstaltungen: 0,
  alleErsthelfer: [],
});
