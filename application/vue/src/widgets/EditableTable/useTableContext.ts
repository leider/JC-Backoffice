import { createContext, useContext, useState } from "react";

type TableContextType = { endEdit: (value: EndEditingCallback) => void };

export const TableContext = createContext<TableContextType>({ endEdit: () => {} });

type EndEditingCallback = { endEditing: () => void };

export function useCreateTableContext(): TableContextType {
  const [currentlyEditingRow, setCurrentlyEditingRow] = useState<EndEditingCallback | undefined>(undefined);
  function endEdit(value: EndEditingCallback) {
    currentlyEditingRow?.endEditing();
    setCurrentlyEditingRow(value);
  }

  return { endEdit };
}

export function useTableContext() {
  return useContext(TableContext);
}
