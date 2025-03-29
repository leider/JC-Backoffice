import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeAll, afterAll, afterEach } from "vitest";
import { JazzRouter } from "@/router/JazzRouter.tsx";
import React from "react";
import JazzclubApp from "@/app/JazzclubApp.tsx";
import { server } from "./mockserver/node.js";

describe("Playing Around", () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it("should first", async () => {
    //const user = userEvent.setup();
    window.history.pushState({}, "Test page", "/vue");

    const { getByText } = render(<JazzclubApp />, { wrapper: JazzRouter });
    await waitFor(() => {
      getByText("Veranstaltungen");
    });
  });

  it("should second", async () => {
    //const user = userEvent.setup();
    window.history.pushState({}, "Test page", "/vue/konzert/new");

    const { getByText } = render(<JazzclubApp />, { wrapper: JazzRouter });
    await waitFor(() => {
      getByText("(Neu)");
    });
  });
});
