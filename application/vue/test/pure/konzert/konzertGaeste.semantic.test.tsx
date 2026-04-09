import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Route, Routes } from "react-router";
import KonzertComp from "../../../src/components/konzert/KonzertComp";
import { fixtureOptionen, fixtureOrte, futureEndDate, futureStartDate, TestHarness, typeInto } from "../harness";

const konzertFixture = {
  startDate: futureStartDate,
  endDate: futureEndDate,
  id: "GaesteTest",
  url: "GaesteTest",
  kopf: {
    titel: "GaesteTest",
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
  },
  artist: {},
  presse: {},
  technik: {},
  unterkunft: {},
  gaesteliste: [],
  reservierungen: [],
};

let capturedKonzert: Record<string, unknown> | undefined;

const server = setupServer(
  http.get("/rest/konzert/GaesteTest", () => HttpResponse.json(konzertFixture)),
  http.get("/rest/riders/GaesteTest", () => HttpResponse.json({ boxes: [] })),
  http.post("/rest/konzert", async ({ request }) => {
    capturedKonzert = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(capturedKonzert);
  }),
  http.post("/rest/optionen", async ({ request }) => HttpResponse.json(await request.json())),
  http.post("/rest/riders", () => HttpResponse.json({})),
  http.get("/rest/fullcalendarevents.json", () => HttpResponse.json([])),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  capturedKonzert = undefined;
  window.scroll = vi.fn();
});

describe("Konzert Gäste – component test", () => {
  it(
    "adds a guest to the Gästeliste and saves",
    async () => {
      const user = userEvent.setup();

      render(
        <TestHarness initialPath="/konzert/GaesteTest?page=gaeste" optionen={fixtureOptionen} orte={fixtureOrte}>
          <Routes>
            <Route element={<KonzertComp />} path="/konzert/:url" />
          </Routes>
        </TestHarness>,
      );

      await waitFor(() => expect(screen.getByText("Gästeliste")).toBeInTheDocument(), { timeout: 5000 });

      // Let useEffect chain settle before interacting with EditableTable
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500));
      });

      const gaesteSection = document.querySelector(".ant-collapse-item") as HTMLElement;
      expect(gaesteSection).toBeTruthy();
      const addBtn = gaesteSection.querySelector('[data-testid="add-in-table"]') as HTMLButtonElement;
      expect(addBtn).toBeTruthy();
      fireEvent.click(addBtn);

      await waitFor(() => expect(document.querySelector("#gaesteliste_0_name")).toBeTruthy());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 500));
      });

      await typeInto(user, "#gaesteliste_0_name", "Stefan Rinderle");
      await typeInto(user, "#gaesteliste_0_comment", "Kommt später");
      await typeInto(user, "#gaesteliste_0_number", "2");
      await user.click(document.querySelector("#gaesteliste_0_name")!);

      await waitFor(
        () => {
          const saveBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          expect(saveBtn).toBeTruthy();
          expect(saveBtn.disabled).toBe(false);
        },
        { timeout: 5000 },
      );

      await user.click(document.querySelector('button[type="submit"]')!);

      await waitFor(() => expect(capturedKonzert).toBeDefined(), { timeout: 5000 });

      const gaesteliste = capturedKonzert!.gaesteliste as Array<Record<string, unknown>>;
      expect(gaesteliste).toHaveLength(1);
      expect(gaesteliste[0].name).toBe("Stefan Rinderle");
      expect(gaesteliste[0].number).toBe(2);
    },
    60000,
  );

  it(
    "adds a reservation and saves",
    async () => {
      const user = userEvent.setup();

      render(
        <TestHarness initialPath="/konzert/GaesteTest?page=gaeste" optionen={fixtureOptionen} orte={fixtureOrte}>
          <Routes>
            <Route element={<KonzertComp />} path="/konzert/:url" />
          </Routes>
        </TestHarness>,
      );

      await waitFor(() => expect(screen.getByText("Reservierungen")).toBeInTheDocument(), { timeout: 5000 });

      // Let useEffect chain settle before interacting with EditableTable
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500));
      });

      const sections = document.querySelectorAll(".ant-collapse-item");
      const reservierungSection = Array.from(sections).find((s) => s.textContent?.includes("Reservierungen"));
      expect(reservierungSection).toBeTruthy();
      const addBtn = reservierungSection!.querySelector('[data-testid="add-in-table"]') as HTMLButtonElement;
      expect(addBtn).toBeTruthy();
      fireEvent.click(addBtn);

      await waitFor(() => expect(document.querySelector("#reservierungen_0_name")).toBeTruthy());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 500));
      });

      await typeInto(user, "#reservierungen_0_name", "Stefan Rinderle");
      await typeInto(user, "#reservierungen_0_number", "12");
      await user.click(document.querySelector("#reservierungen_0_name")!);

      await waitFor(
        () => {
          const saveBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          expect(saveBtn).toBeTruthy();
          expect(saveBtn.disabled).toBe(false);
        },
        { timeout: 5000 },
      );

      await user.click(document.querySelector('button[type="submit"]')!);

      await waitFor(() => expect(capturedKonzert).toBeDefined(), { timeout: 5000 });

      const reservierungen = capturedKonzert!.reservierungen as Array<Record<string, unknown>>;
      expect(reservierungen).toHaveLength(1);
      expect(reservierungen[0].name).toBe("Stefan Rinderle");
      expect(reservierungen[0].number).toBe(12);
    },
    60000,
  );
});
