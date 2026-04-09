import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import OptionValues from "jc-shared/optionen/optionValues";
import Orte, { Ort } from "jc-shared/optionen/orte";
import Optionen from "../../../src/components/options/Optionen";
import OrtePage from "../../../src/components/options/OrtePage";
import { TestHarness, typeInto } from "../harness";

let capturedOptionen: OptionValues | undefined;
let capturedOrte: Orte | undefined;

const emptyOptionen = new OptionValues();
const emptyOrte = new Orte();

const server = setupServer(
  http.get("/rest/optionen", () => HttpResponse.json(emptyOptionen)),
  http.post("/rest/optionen", async ({ request }) => {
    capturedOptionen = (await request.json()) as OptionValues;
    return HttpResponse.json(capturedOptionen);
  }),
  http.get("/rest/orte", () => HttpResponse.json(emptyOrte)),
  http.post("/rest/orte", async ({ request }) => {
    capturedOrte = (await request.json()) as Orte;
    return HttpResponse.json(capturedOrte);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  capturedOptionen = undefined;
  capturedOrte = undefined;
  window.scroll = vi.fn();
});

describe("Optionen anlegen – component test", () => {
  it(
    "saves Kooperationen",
    async () => {
      const user = userEvent.setup();

      render(
        <TestHarness>
          <Optionen />
        </TestHarness>,
      );

      await waitFor(() => expect(screen.getByText(/Kooperationen/)).toBeInTheDocument(), { timeout: 5000 });

      await typeInto(user, "#kooperationen", "UI Test");
      await user.keyboard("{Enter}");

      await waitFor(
        () => {
          const saveBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          expect(saveBtn).toBeTruthy();
          expect(saveBtn.disabled).toBe(false);
        },
        { timeout: 5000 },
      );

      await user.click(document.querySelector('button[type="submit"]')!);

      await waitFor(() => expect(capturedOptionen).toBeDefined());

      expect(capturedOptionen!.kooperationen).toContain("UI Test");
    },
    60000,
  );
});

describe("Orte erzeugen – component test", () => {
  it(
    "adds an Ort, verifies table row, and saves",
    async () => {
      const user = userEvent.setup();

      render(
        <TestHarness>
          <OrtePage />
        </TestHarness>,
      );

      await waitFor(() => expect(screen.getByText("Orte")).toBeInTheDocument());

      // Let the useEffect chain in JazzFormAndHeaderExtended fully settle
      // (loaded flip causes checkErrors identity change → effect re-fires → form reset)
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500));
      });

      const addButton = document.querySelector('[data-testid="add-in-table"]') as HTMLButtonElement;
      expect(addButton).toBeTruthy();
      fireEvent.click(addButton);

      await waitFor(() => expect(document.querySelector("#orte_0_name")).toBeTruthy());

      // Let pending effects from the add settle before typing
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500));
      });

      expect(document.querySelectorAll(".ant-table-row").length).toBeGreaterThan(0);

      await typeInto(user, "#orte_0_name", "Jazzclub");
      await typeInto(user, "#orte_0_pressename", "JazzclubPresseName");
      await typeInto(user, "#orte_0_presseIn", "Im Jazzclub");
      await typeInto(user, "#orte_0_flaeche", "300");
      await user.click(document.querySelector("#orte_0_name")!);

      await waitFor(
        () => {
          const saveBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          expect(saveBtn).toBeTruthy();
          expect(saveBtn.disabled).toBe(false);
        },
        { timeout: 5000 },
      );

      await user.click(document.querySelector('button[type="submit"]')!);

      await waitFor(() => expect(capturedOrte).toBeDefined());

      const savedOrte = capturedOrte!.orte as Ort[];
      expect(savedOrte).toHaveLength(1);
      expect(savedOrte[0].name).toBe("Jazzclub");
      expect(savedOrte[0].flaeche).toBe(300);
      expect(savedOrte[0].pressename).toBe("JazzclubPresseName");
      expect(savedOrte[0].presseIn).toBe("Im Jazzclub");
    },
    30000,
  );
});
