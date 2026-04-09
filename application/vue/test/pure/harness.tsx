import { PropsWithChildren, useMemo, useState } from "react";
import { expect } from "vitest";
import { waitFor } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { App, ConfigProvider } from "antd";
import localeDe from "antd/lib/locale/de_DE";
import User from "jc-shared/user/user";
import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import Konzert from "jc-shared/konzert/konzert";
import { JazzContext } from "../../src/components/content/useJazzContext";
import { GlobalContext } from "../../src/app/GlobalContext";
import noop from "lodash/noop";

export const futureStartDate = "2099-01-15T17:30:00.000Z";
export const futureEndDate = "2099-01-15T19:00:00.000Z";

/**
 * Wait for a DOM element to appear, clear it, and type a value.
 * Handles editable-table fields where re-renders replace DOM nodes.
 */
export async function typeInto(user: UserEvent, selector: string, value: string) {
  await waitFor(() => expect(document.querySelector(selector)).toBeTruthy());
  const el = document.querySelector(selector) as HTMLInputElement;
  await user.clear(el);
  await user.type(el, value);
}

export const fixtureOptionen = new OptionValues({
  id: "instance",
  typenPlus: [
    {
      name: "Club Konzert",
      color: "#4faee3",
      mod: true,
      kasseV: true,
      kasse: false,
      technikerV: true,
      techniker: true,
      merchandise: false,
    },
    { name: "Homegrown", color: "#24719d", mod: true, kasseV: true, kasse: false, techniker: false, technikerV: false, merchandise: false },
  ] as unknown as OptionValues["typenPlus"],
});

export const fixtureOrte = new Orte({
  id: "orte",
  orte: [{ name: "Jazzclub", flaeche: 100, pressename: "Jazzclub Karlsruhe", presseIn: "im Jazzclub Karlsruhe" }],
});

type HarnessProps = {
  initialPath?: string;
  optionen?: OptionValues;
  orte?: Orte;
  allUsers?: User[];
};

export function TestHarness({ children, initialPath = "/", optionen, orte, allUsers }: PropsWithChildren<HarnessProps>) {
  const [isDirty, setIsDirty] = useState(false);

  const jazzContextValue = useMemo(
    () => ({
      currentUser: new User({ id: "admin", name: "Admin", gruppen: "superusers" }),
      wikisubdirs: [] as string[],
      allUsers: allUsers ?? ([] as User[]),
      optionen: optionen ?? new OptionValues(),
      orte: orte ?? new Orte(),
      todayKonzerte: [] as Konzert[],
      showSuccess: noop as never,
      showError: noop as never,
      teamFilter: {},
      setTeamFilter: noop,
      isDirty,
      setIsDirty,
      setMemoizedVeranstaltung: noop,
      isDarkMode: false,
      isCompactMode: false,
    }),
    [isDirty, optionen, orte, allUsers],
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
      }),
  );

  const globalContextValue = useMemo(
    () => ({ isDarkMode: false, isCompactMode: false, viewport: { width: 1400, height: 900 }, isTouch: false }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={localeDe}>
        <App>
          <GlobalContext.Provider value={globalContextValue}>
            <JazzContext.Provider value={jazzContextValue}>
              <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
            </JazzContext.Provider>
          </GlobalContext.Provider>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
