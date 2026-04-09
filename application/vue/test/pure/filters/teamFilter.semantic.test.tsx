import { useCallback, useMemo, useState } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import User from "jc-shared/user/user";
import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import Konzert from "jc-shared/konzert/konzert";
import { TeamUndVeranstaltungen } from "../../../src/components/team/TeamUndVeranstaltungen";
import { JazzContext } from "../../../src/components/content/useJazzContext";
import { GlobalContext } from "../../../src/app/GlobalContext";
import { TeamFilterObject } from "../../../src/components/team/TeamFilter/applyTeamFilter";
import { AntdAndLocaleTestContext } from "../../util/testHelper";
import noop from "lodash/noop";

// --- fixture factory (mirrors frontendtests/tests/20_filter_test.ts) ---

let count = 0;
const start = new Date("2020-03-20T17:30:00.000Z");
const end = new Date("2020-03-20T19:00:00.000Z");

function addDaysTo(date: Date, days: number) {
  const result = new Date(date.valueOf());
  result.setDate(result.getDate() + days);
  return result;
}

function konzertFixture(
  overrides: {
    kopf?: Record<string, unknown>;
    technik?: Record<string, unknown>;
    presse?: Record<string, unknown>;
    artist?: Record<string, unknown>;
    unterkunft?: Record<string, unknown>;
  },
  name: string,
) {
  count++;
  return {
    startDate: addDaysTo(start, count).toISOString(),
    endDate: addDaysTo(end, count).toISOString(),
    kopf: {
      beschreibung: "",
      eventTyp: "Club Konzert",
      flaeche: 100,
      kooperation: "",
      ort: "Jazzclub",
      pressename: "Jazzclub Karlsruhe",
      presseIn: "im Jazzclub Karlsruhe",
      genre: "",
      confirmed: false,
      rechnungAnKooperation: false,
      abgesagt: false,
      fotografBestellen: false,
      kannAufHomePage: false,
      kannInSocialMedia: false,
      titel: name,
      ...overrides.kopf,
    },
    artist: { ...overrides.artist },
    presse: { ...overrides.presse },
    technik: { ...overrides.technik },
    unterkunft: { ...overrides.unterkunft },
    id: name,
    url: name,
  };
}

function buildFixtureData() {
  return [
    konzertFixture({}, "Neutral"),
    konzertFixture({ kopf: { confirmed: true } }, "Bestätigt"),
    konzertFixture({ kopf: { abgesagt: true } }, "Cancelled"),
    konzertFixture({ presse: { checked: true } }, "PresseOK"),
    konzertFixture({ kopf: { kannAufHomePage: true } }, "KannAufHomepage"),
    konzertFixture({ kopf: { kannInSocialMedia: true } }, "KannAufSocialMedia"),
    konzertFixture({ presse: { text: "Text" } }, "TextVorhanden"),
    konzertFixture({ presse: { originalText: "Original Text" } }, "OriginaltextVorhanden"),
    konzertFixture({ kopf: { fotografBestellen: true } }, "FotografEinladen"),
    konzertFixture({ technik: { checked: true } }, "TechnikChecked"),
    konzertFixture({ technik: { fluegel: true } }, "Fluegel"),
    konzertFixture({ artist: { brauchtHotel: true }, unterkunft: { bestaetigt: true } }, "HotelBestatigt"),
    konzertFixture({ artist: { brauchtHotel: true }, unterkunft: { bestaetigt: false } }, "HotelNichtBestatigt"),
  ];
}

// --- MSW mock server ---

const server = setupServer(
  http.get("/rest/konzerte/alle", () => HttpResponse.json(buildFixtureData())),
  http.get("/rest/vermietungen/alle", () => HttpResponse.json([])),
);

// --- Test harness ---

function Harness() {
  const [teamFilter, setTeamFilter] = useState<TeamFilterObject>({});

  const jazzContextValue = useMemo(
    () => ({
      currentUser: new User({ id: "admin", name: "Admin", gruppen: "superusers" }),
      wikisubdirs: [] as string[],
      allUsers: [] as User[],
      optionen: new OptionValues(),
      orte: new Orte(),
      todayKonzerte: [] as Konzert[],
      showSuccess: noop as never,
      showError: noop as never,
      teamFilter,
      setTeamFilter,
      isDirty: false,
      setIsDirty: noop,
      setMemoizedVeranstaltung: noop,
      isDarkMode: false,
      isCompactMode: false,
    }),
    [teamFilter, setTeamFilter],
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
  );

  const globalContextValue = useMemo(
    () => ({ isDarkMode: false, isCompactMode: false, viewport: { width: 1400, height: 900 }, isTouch: false }),
    [],
  );

  const scrollMock = useCallback(() => {}, []);
  if (typeof window.scroll !== "function" || !window.scroll.toString().includes("native")) {
    window.scroll = scrollMock;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AntdAndLocaleTestContext>
        <GlobalContext.Provider value={globalContextValue}>
          <JazzContext.Provider value={jazzContextValue}>
            <MemoryRouter initialEntries={["/veranstaltungen"]}>
              <TeamUndVeranstaltungen />
            </MemoryRouter>
          </JazzContext.Provider>
        </GlobalContext.Provider>
      </AntdAndLocaleTestContext>
    </QueryClientProvider>
  );
}

// --- lifecycle ---

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  count = 0;
  localStorage.setItem("veranstaltungenPeriod", "Alle");
  window.scroll = noop;
});

// --- fast native DOM helpers (avoid slow getByRole / queryAllByRole) ---

function linkTextsInTable(): string[] {
  const links = document.querySelectorAll(".ant-table-tbody a");
  return Array.from(links, (a) => a.textContent ?? "");
}

function seeInTable(name: string) {
  expect(linkTextsInTable().some((t) => t.includes(name))).toBe(true);
}

function dontSeeInTable(name: string) {
  expect(linkTextsInTable().every((t) => !t.includes(name))).toBe(true);
}

async function waitForDataLoaded() {
  await waitFor(() => seeInTable("Neutral"), { timeout: 5000 });
}

function findCheckbox(dialog: HTMLElement, label: string): HTMLInputElement {
  const labels = dialog.querySelectorAll<HTMLElement>(".ant-checkbox-wrapper");
  for (const wrapper of labels) {
    if (wrapper.textContent?.trim() === label) {
      const input = wrapper.querySelector("input[type='checkbox']");
      if (input) return input as HTMLInputElement;
    }
  }
  throw new Error(`Checkbox "${label}" not found in dialog`);
}

async function openFilterDialogAndExpand(): Promise<HTMLElement> {
  fireEvent.click(screen.getByRole("button", { name: "Filter..." }));
  const dialog = await screen.findByRole("dialog");
  for (const id of ["#Filter-Öffentlichkeit", "#Filter-Technik"]) {
    const header = dialog.querySelector(`${id} .ant-collapse-header`);
    if (header) fireEvent.click(header);
  }
  await waitFor(() => findCheckbox(dialog, "Flügel stimmen"));
  return dialog;
}

function clickCheckbox(dialog: HTMLElement, label: string) {
  fireEvent.click(findCheckbox(dialog, label));
}

/**
 * Cycle through ThreewayCheckbox states (undefined → true → false → undefined)
 * and assert the table after each click.
 */
async function setAndCheck(dialog: HTMLElement, checkboxLabel: string, expectedTitle: string) {
  // click 1: undefined → true  →  only matching item
  clickCheckbox(dialog, checkboxLabel);
  await waitFor(() => {
    seeInTable(expectedTitle);
    dontSeeInTable("Neutral");
  });

  // click 2: true → false  →  everything except matching item
  clickCheckbox(dialog, checkboxLabel);
  await waitFor(() => {
    dontSeeInTable(expectedTitle);
    seeInTable("Neutral");
  });

  // click 3: false → undefined  →  back to all
  clickCheckbox(dialog, checkboxLabel);
  await waitFor(() => {
    seeInTable(expectedTitle);
    seeInTable("Neutral");
  });
}

// --- tests ---

describe("Filter in der Übersicht (Veranstaltungen) – component test", () => {
  it(
    "renders all Konzerte, then setAndCheck for every boolean filter",
    async () => {
      render(<Harness />);
      await waitForDataLoaded();

      for (const name of [
        "Neutral",
        "Bestätigt",
        "Cancelled",
        "PresseOK",
        "KannAufHomepage",
        "KannAufSocialMedia",
        "TextVorhanden",
        "OriginaltextVorhanden",
        "FotografEinladen",
        "TechnikChecked",
        "Fluegel",
        "HotelBestatigt",
        "HotelNichtBestatigt",
      ]) {
        seeInTable(name);
      }

      const dialog = await openFilterDialogAndExpand();

      await setAndCheck(dialog, "Ist bestätigt", "Bestätigt");
      await setAndCheck(dialog, "Ist abgesagt", "Cancelled");
      await setAndCheck(dialog, "Presse OK", "PresseOK");
      await setAndCheck(dialog, "Ist auf Homepage", "KannAufHomepage");
      await setAndCheck(dialog, "Kann Social Media", "KannAufSocialMedia");
      await setAndCheck(dialog, "Text vorhanden", "TextVorhanden");
      await setAndCheck(dialog, "Originaltext vorhanden", "OriginaltextVorhanden");
      await setAndCheck(dialog, "Fotograf einladen", "FotografEinladen");
      await setAndCheck(dialog, "Technik ist geklärt", "TechnikChecked");
      await setAndCheck(dialog, "Flügel stimmen", "Fluegel");
    },
    120000,
  );

  it(
    "filters Hotel bestätigt / nicht bestätigt (tri-state)",
    async () => {
      render(<Harness />);
      await waitForDataLoaded();

      seeInTable("HotelBestatigt");
      seeInTable("HotelNichtBestatigt");

      const dialog = await openFilterDialogAndExpand();

      // true → only confirmed hotel
      clickCheckbox(dialog, "Hotel bestätigt");
      await waitFor(() => {
        seeInTable("HotelBestatigt");
        dontSeeInTable("HotelNichtBestatigt");
        dontSeeInTable("Neutral");
      });

      // false → only unconfirmed hotel
      clickCheckbox(dialog, "Hotel bestätigt");
      await waitFor(() => {
        seeInTable("HotelNichtBestatigt");
        dontSeeInTable("HotelBestatigt");
        dontSeeInTable("Neutral");
      });

      // back to undefined → all visible
      clickCheckbox(dialog, "Hotel bestätigt");
      await waitFor(() => {
        seeInTable("Neutral");
        seeInTable("HotelBestatigt");
        seeInTable("HotelNichtBestatigt");
      });
    },
    30000,
  );
});
