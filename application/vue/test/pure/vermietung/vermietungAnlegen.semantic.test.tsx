import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Route, Routes } from "react-router";
import VermietungComp from "../../../src/components/vermietung/VermietungComp";
import { fixtureOrte, TestHarness, typeInto } from "../harness";

let capturedVermietung: Record<string, unknown> | undefined;

const server = setupServer(
  http.post("/rest/vermietung", async ({ request }) => {
    capturedVermietung = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(capturedVermietung);
  }),
  http.get("/rest/fullcalendarevents.json", () => HttpResponse.json([])),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  capturedVermietung = undefined;
  window.scroll = vi.fn();
});

describe("Vermietung anlegen – component test", () => {
  it(
    "creates a new Vermietung with title and Saalmiete, then saves",
    async () => {
      const user = userEvent.setup();

      render(
        <TestHarness initialPath="/vermietung/new?page=allgemeines" orte={fixtureOrte}>
          <Routes>
            <Route element={<VermietungComp />} path="/vermietung/:url" />
          </Routes>
        </TestHarness>,
      );

      await waitFor(() => expect(screen.getByText("Event")).toBeInTheDocument(), { timeout: 5000 });

      await typeInto(user, "#kopf_titel", "Vermietung #1");
      await typeInto(user, "#saalmiete", "100");

      await waitFor(
        () => {
          const saveBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          expect(saveBtn).toBeTruthy();
          expect(saveBtn.disabled).toBe(false);
        },
        { timeout: 5000 },
      );

      await user.click(document.querySelector('button[type="submit"]')!);

      await waitFor(() => expect(capturedVermietung).toBeDefined(), { timeout: 5000 });

      const kopf = capturedVermietung!.kopf as Record<string, unknown>;
      expect(kopf.titel).toBe("Vermietung #1");
    },
    60000,
  );
});
