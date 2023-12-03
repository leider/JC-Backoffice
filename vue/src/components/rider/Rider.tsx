import type { FC } from "react";
import { useCallback, useState } from "react";
import { Container } from "@/components/rider/Container.tsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const Rider: FC = () => {
  const [hideSourceOnDrag, setHideSourceOnDrag] = useState(true);
  const toggle = useCallback(() => setHideSourceOnDrag(!hideSourceOnDrag), [hideSourceOnDrag]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Container hideSourceOnDrag={hideSourceOnDrag} />
      <p>
        <label htmlFor="hideSourceOnDrag">
          <input id="hideSourceOnDrag" type="checkbox" role="checkbox" checked={hideSourceOnDrag} onChange={toggle} />
          <small>Hide the source item while dragging</small>
        </label>
      </p>
    </DndProvider>
  );
};
