import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Route, Routes } from "react-router";
import find from "lodash/find";
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
let currentFixture = { ...konzertFixture };

const server = setupServer(
  http.get("/rest/konzert/GaesteTest", () => HttpResponse.json(currentFixture)),
  http.get("/rest/riders/GaesteTest", () => HttpResponse.json({ boxes: [] })),
  http.post("/rest/konzert", async ({ request }) => {
    capturedKonzert = (await request.json()) as Record<string, unknown>;
    currentFixture = capturedKonzert as typeof currentFixture;
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
  currentFixture = { ...konzertFixture };
  window.scroll = vi.fn();
});

describe("Konzert Gäste – component test", () => {
  it("adds a guest to the Gästeliste and saves", async () => {
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
  }, 60000);

  it("adds a reservation and saves", async () => {
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
    const reservierungSection = find(Array.from(sections), (s) => s.textContent?.includes("Reservierungen"));
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
  }, 60000);

  it("copies a guest, renames the copy, deletes the original, then deletes all", async () => {
    const user = userEvent.setup();

    render(
      <TestHarness initialPath="/konzert/GaesteTest?page=gaeste" optionen={fixtureOptionen} orte={fixtureOrte}>
        <Routes>
          <Route element={<KonzertComp />} path="/konzert/:url" />
        </Routes>
      </TestHarness>,
    );

    await waitFor(() => expect(screen.getByText("Gästeliste")).toBeInTheDocument(), { timeout: 5000 });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    // --- Step 1: Add a guest ---
    const gaesteSection = document.querySelector(".ant-collapse-item") as HTMLElement;
    fireEvent.click(gaesteSection.querySelector('[data-testid="add-in-table"]')!);
    await waitFor(() => expect(document.querySelector("#gaesteliste_0_name")).toBeTruthy());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    await typeInto(user, "#gaesteliste_0_name", "Stefan Rinderle");
    await typeInto(user, "#gaesteliste_0_comment", "Kommt später");
    await typeInto(user, "#gaesteliste_0_number", "2");
    await user.click(document.querySelector("#gaesteliste_0_name")!);

    await waitFor(() => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(btn?.disabled).toBe(false);
    });
    await user.click(document.querySelector('button[type="submit"]')!);
    await waitFor(() => expect(capturedKonzert).toBeDefined(), { timeout: 5000 });

    let gaesteliste = capturedKonzert!.gaesteliste as Array<Record<string, unknown>>;
    expect(gaesteliste).toHaveLength(1);
    expect(gaesteliste[0].name).toBe("Stefan Rinderle");

    // --- Step 2: Copy the guest row ---
    capturedKonzert = undefined;
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    const copyBtn = gaesteSection.querySelector(".bi-files")?.closest("button");
    expect(copyBtn).toBeTruthy();
    fireEvent.click(copyBtn!);

    await waitFor(() => expect(document.querySelector("#gaesteliste_1_name")).toBeTruthy());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    // --- Step 3: Rename the copied row ---
    await typeInto(user, "#gaesteliste_1_name", "Mario Rinderle");
    await user.click(document.querySelector("#gaesteliste_0_name")!);

    await waitFor(() => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(btn?.disabled).toBe(false);
    });
    await user.click(document.querySelector('button[type="submit"]')!);
    await waitFor(() => expect(capturedKonzert).toBeDefined(), { timeout: 5000 });

    gaesteliste = capturedKonzert!.gaesteliste as Array<Record<string, unknown>>;
    expect(gaesteliste).toHaveLength(2);
    expect(gaesteliste[1].name).toBe("Mario Rinderle");

    // --- Step 4: Delete original (first) row ---
    capturedKonzert = undefined;
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    const trashBtns = gaesteSection.querySelectorAll(".bi-trash");
    expect(trashBtns.length).toBeGreaterThan(0);
    fireEvent.click(trashBtns[0].closest("button")!);

    await waitFor(() => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(btn?.disabled).toBe(false);
    });
    await user.click(document.querySelector('button[type="submit"]')!);
    await waitFor(() => expect(capturedKonzert).toBeDefined(), { timeout: 5000 });

    gaesteliste = capturedKonzert!.gaesteliste as Array<Record<string, unknown>>;
    expect(gaesteliste).toHaveLength(1);
    expect(gaesteliste[0].name).toBe("Mario Rinderle");

    // --- Step 5: Delete remaining row → empty ---
    capturedKonzert = undefined;
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    const remainingTrash = gaesteSection.querySelector(".bi-trash")?.closest("button");
    expect(remainingTrash).toBeTruthy();
    fireEvent.click(remainingTrash!);

    await waitFor(() => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(btn?.disabled).toBe(false);
    });
    await user.click(document.querySelector('button[type="submit"]')!);
    await waitFor(() => expect(capturedKonzert).toBeDefined(), { timeout: 5000 });

    gaesteliste = capturedKonzert!.gaesteliste as Array<Record<string, unknown>>;
    expect(gaesteliste).toHaveLength(0);
  }, 120000);

  it("updates alreadyIn on an existing guest", async () => {
    currentFixture = {
      ...konzertFixture,
      gaesteliste: [{ name: "Stefan Rinderle", comment: "Kommt später", number: 2, alreadyIn: 0 }] as typeof konzertFixture.gaesteliste,
    };

    const user = userEvent.setup();

    render(
      <TestHarness initialPath="/konzert/GaesteTest?page=gaeste" optionen={fixtureOptionen} orte={fixtureOrte}>
        <Routes>
          <Route element={<KonzertComp />} path="/konzert/:url" />
        </Routes>
      </TestHarness>,
    );

    await waitFor(() => expect(screen.getByText("Gästeliste")).toBeInTheDocument(), { timeout: 5000 });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500));
    });

    await waitFor(() => expect(document.querySelector("#gaesteliste_0_alreadyIn")).toBeTruthy());
    await typeInto(user, "#gaesteliste_0_alreadyIn", "1");
    await user.click(document.querySelector("#gaesteliste_0_name")!);

    await waitFor(() => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(btn?.disabled).toBe(false);
    });
    await user.click(document.querySelector('button[type="submit"]')!);

    await waitFor(() => expect(capturedKonzert).toBeDefined(), { timeout: 5000 });

    const gaesteliste = capturedKonzert!.gaesteliste as Array<Record<string, unknown>>;
    expect(gaesteliste).toHaveLength(1);
    expect(gaesteliste[0].name).toBe("Stefan Rinderle");
    expect(gaesteliste[0].alreadyIn).toBe(1);
  }, 60000);
});
