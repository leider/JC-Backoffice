import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Route, Routes } from "react-router";
import KonzertComp from "../../../src/components/konzert/KonzertComp";
import { fixtureOptionen, fixtureOrte, futureEndDate, futureStartDate, TestHarness } from "../harness";

const kopiervorlage = {
  startDate: futureStartDate,
  endDate: futureEndDate,
  id: "Kopiervorlage",
  url: "Kopiervorlage",
  kopf: {
    titel: "Kopiervorlage",
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
};

let capturedKonzert: Record<string, unknown> | undefined;

const server = setupServer(
  http.get("/rest/konzert/Kopiervorlage", () => HttpResponse.json(kopiervorlage)),
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

describe("Konzert kopieren – component test", () => {
  it("copies a Konzert, changes the title in the copy modal, and saves", async () => {
    render(
      <TestHarness initialPath="/konzert/copy-of-Kopiervorlage?page=allgemeines" optionen={fixtureOptionen} orte={fixtureOrte}>
        <Routes>
          <Route element={<KonzertComp />} path="/konzert/:url" />
        </Routes>
      </TestHarness>,
    );

    // Let the useEffect chain in JazzFormAndHeaderExtended fully settle
    // so that useWatch("startDate") returns a value and ShowOnCopy can open the modal
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1000));
    });

    await waitFor(() => expect(screen.getByText("Kopiertes Konzert")).toBeInTheDocument(), { timeout: 10000 });
    expect(screen.getByText("Weiter")).toBeInTheDocument();

    const modalTitelInput = document.querySelector(".ant-modal #kopf_titel") as HTMLInputElement;
    if (modalTitelInput) {
      fireEvent.focus(modalTitelInput);
      fireEvent.change(modalTitelInput, { target: { value: "Kopiertes Konzert" } });
      fireEvent.blur(modalTitelInput);
    }

    fireEvent.click(screen.getByText("Weiter"));

    await waitFor(
      () => {
        const saveBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        expect(saveBtn).toBeTruthy();
        expect(saveBtn.disabled).toBe(false);
      },
      { timeout: 10000 },
    );

    fireEvent.click(document.querySelector('button[type="submit"]')!);

    await waitFor(() => expect(capturedKonzert).toBeDefined(), { timeout: 5000 });

    const kopf = capturedKonzert!.kopf as Record<string, unknown>;
    expect(kopf.titel).toBe("Kopiertes Konzert");
  }, 60000);
});
