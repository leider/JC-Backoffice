import { createContext } from "react";

type JazzFormSharedGlobals = {
  checkDirty: () => boolean;
};
export const JazzFormContext = createContext<JazzFormSharedGlobals>({
  // eslint-disable-next-line lodash/prefer-constant
  checkDirty: () => false,
});
