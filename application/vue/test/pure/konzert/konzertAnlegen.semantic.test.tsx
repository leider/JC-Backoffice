import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Route, Routes } from "react-router";
import KonzertComp from "../../../src/components/konzert/KonzertComp";
import { fixtureOptionen, fixtureOrte, TestHarness, typeInto } from "../harness";

let capturedKonzert: Record<string, unknown> | undefined;

const server = setupServer(
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

async function selectAntdOption(inputEl: HTMLElement, optionText: string) {
  const selectWrapper = inputEl.closest(".ant-select");
  if (!selectWrapper) throw new Error("Not inside an AntD Select");
  const clickTarget = selectWrapper.querySelector(".ant-select-content") ?? selectWrapper;
  fireEvent.mouseDown(clickTarget);
  await waitFor(() => {
    const options = document.querySelectorAll(".ant-select-item-option");
    const match = Array.from(options).find((o) => o.textContent?.includes(optionText));
    expect(match).toBeTruthy();
    fireEvent.click(match!);
  });
}

describe("Konzert anlegen – component test", () => {
  it(
    "creates a new Konzert with title and type, then saves",
    async () => {
      const user = userEvent.setup();

      render(
        <TestHarness initialPath="/konzert/new?page=allgemeines" optionen={fixtureOptionen} orte={fixtureOrte}>
          <Routes>
            <Route element={<KonzertComp />} path="/konzert/:url" />
          </Routes>
        </TestHarness>,
      );

      await waitFor(() => expect(screen.getByText("Event")).toBeInTheDocument(), { timeout: 5000 });

      await typeInto(user, "#kopf_titel", "Konzert #1");

      await waitFor(() => expect(document.querySelector("#kopf_eventTyp")).toBeTruthy());
      await selectAntdOption(document.querySelector("#kopf_eventTyp")!, "Club Konzert");

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

      const kopf = capturedKonzert!.kopf as Record<string, unknown>;
      expect(kopf.titel).toBe("Konzert #1");
      expect(kopf.eventTyp).toBe("Club Konzert");
      expect(kopf.ort).toBe("Jazzclub");
      expect(kopf.pressename).toBe("Jazzclub Karlsruhe");
      expect(kopf.presseIn).toBe("im Jazzclub Karlsruhe");
      expect(kopf.flaeche).toBe(100);
      expect(capturedKonzert!.startDate).toBeDefined();
      expect(capturedKonzert!.endDate).toBeDefined();
    },
    60000,
  );
});
